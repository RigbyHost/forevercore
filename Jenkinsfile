pipeline {
    agent {
        kubernetes {
            label "jenkins-agent-kaniko-debug-${UUID.randomUUID().toString()}"
            yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins-agent-sa
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ['/busybox/sh']
    args: ['-c', 'trap : TERM INT; sleep infinity & wait']
    tty: true
  - name: kubectl
    image: alpine/k8s:1.30.12
    command: ['/bin/sh']
    args: ['-c', 'trap : TERM INT; sleep infinity & wait']
    tty: true
    volumeMounts:
      - name: workspace-volume
        mountPath: /home/jenkins/agent
        readOnly: false
  - name: node
    image: node:18-alpine
    command: ['/bin/sh']
    args: ['-c', 'trap : TERM INT; sleep infinity & wait']
    tty: true
"""
            defaultContainer 'jnlp'
        }
    }

    environment {
        DOCKER_REGISTRY = "registry.forever-gdps.host"
        IMAGE_NAME = "forevercore-gdps"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        NAMESPACE = "gdps"
        APP_NAME = "forevercore"
        DOMAIN = "gdps.forever-gdps.host"
        
        // Application configuration
        GDPS_NAME = "ForeverCore GDPS"
        GDPS_ID = "main"
        NODE_ENV = "production"
        
        // Database credentials (should be stored in Jenkins credentials)
        DB_PASSWORD = credentials('gdps-db-password')
        MYSQL_ROOT_PASSWORD = credentials('mysql-root-password')
        REDIS_PASSWORD = credentials('redis-password')
        GJP_SECRET = credentials('gdps-gjp-secret')
        XOR_KEY = credentials('gdps-xor-key')
        ADMIN_EMAIL = credentials('gdps-admin-email')
    }

    parameters {
        choice(
            name: 'DEPLOYMENT_TARGET',
            choices: ['development', 'staging', 'production'],
            description: 'Select deployment target'
        )
        choice(
            name: 'RUNTIME',
            choices: ['node', 'bun'],
            description: 'Select JavaScript runtime'
        )
        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: 'Run tests before deployment'
        )
        booleanParam(
            name: 'SKIP_CACHE',
            defaultValue: false,
            description: 'Skip Docker build cache'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    env.BUILD_TIME = sh(returnStdout: true, script: 'date -u +"%Y-%m-%dT%H:%M:%SZ"').trim()
                }
            }
        }

        stage('Setup Environment') {
            steps {
                container('node') {
                    sh '''
                    echo '>>> Setting up environment...'
                    node --version
                    npm --version
                    
                    # Create .env file for build
                    cat > .env << EOF
NODE_ENV=${NODE_ENV}
GDPS_NAME="${GDPS_NAME}"
GDPS_ID=${GDPS_ID}
BUILD_NUMBER=${BUILD_NUMBER}
GIT_COMMIT=${GIT_COMMIT_SHORT}
BUILD_TIME=${BUILD_TIME}
EOF
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                container('node') {
                    sh '''
                    echo '>>> Installing dependencies...'
                    npm ci
                    '''
                }
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                container('node') {
                    sh '''
                    echo '>>> Running tests...'
                    
                    # TypeScript compilation check
                    echo 'Checking TypeScript compilation...'
                    npx tsc --noEmit
                    
                    # Run linting if available
                    if [ -f "package.json" ] && npm run | grep -q "lint"; then
                        echo 'Running linting...'
                        npm run lint
                    fi
                    
                    # Run unit tests if available
                    if [ -f "package.json" ] && npm run | grep -q "test"; then
                        echo 'Running unit tests...'
                        npm test
                    fi
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Node.js Image') {
                    when {
                        expression { params.RUNTIME == 'node' || params.RUNTIME == 'both' }
                    }
                    steps {
                        container('kaniko') {
                            script {
                                def cacheFlag = params.SKIP_CACHE ? '--no-cache' : '--cache=true'
                                
                                sh """
                                echo '>>> Building Docker image with Node.js runtime...'
                                
                                /kaniko/executor --context=dir://. \\
                                  --dockerfile=Dockerfile \\
                                  --target=production \\
                                  --destination=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}-node \\
                                  --destination=${DOCKER_REGISTRY}/${IMAGE_NAME}:latest-node \\
                                  ${cacheFlag} \\
                                  --verbosity=info \\
                                  --build-arg NODE_ENV=${NODE_ENV} \\
                                  --build-arg BUILD_NUMBER=${BUILD_NUMBER} \\
                                  --build-arg GIT_COMMIT=${GIT_COMMIT_SHORT}
                                """
                            }
                        }
                    }
                }
                
                stage('Build Bun Image') {
                    when {
                        expression { params.RUNTIME == 'bun' }
                    }
                    steps {
                        container('kaniko') {
                            script {
                                def cacheFlag = params.SKIP_CACHE ? '--no-cache' : '--cache=true'
                                
                                sh """
                                echo '>>> Building Docker image with Bun runtime...'
                                
                                /kaniko/executor --context=dir://. \\
                                  --dockerfile=Dockerfile \\
                                  --target=bun-production \\
                                  --destination=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}-bun \\
                                  --destination=${DOCKER_REGISTRY}/${IMAGE_NAME}:latest-bun \\
                                  ${cacheFlag} \\
                                  --verbosity=info \\
                                  --build-arg NODE_ENV=${NODE_ENV} \\
                                  --build-arg BUILD_NUMBER=${BUILD_NUMBER} \\
                                  --build-arg GIT_COMMIT=${GIT_COMMIT_SHORT}
                                """
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    script {
                        def imageTag = params.RUNTIME == 'bun' ? "${IMAGE_TAG}-bun" : "${IMAGE_TAG}-node"
                        def targetNamespace = "${NAMESPACE}-${params.DEPLOYMENT_TARGET}"
                        
                        sh "kubectl create namespace ${targetNamespace} --dry-run=client -o yaml | kubectl apply -f -"

                        // Create ConfigMap for environment variables
                        sh """
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${APP_NAME}-config
  namespace: ${targetNamespace}
data:
  NODE_ENV: "${NODE_ENV}"
  GDPS_NAME: "${GDPS_NAME}"
  GDPS_ID: "${GDPS_ID}"
  BUILD_NUMBER: "${BUILD_NUMBER}"
  GIT_COMMIT: "${GIT_COMMIT_SHORT}"
  BUILD_TIME: "${BUILD_TIME}"
  DEPLOYMENT_TARGET: "${params.DEPLOYMENT_TARGET}"
  RUNTIME: "${params.RUNTIME}"
EOF
"""

                        // Create Secret for sensitive data
                        sh """
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: ${APP_NAME}-secrets
  namespace: ${targetNamespace}
type: Opaque
stringData:
  DB_PASSWORD: "${DB_PASSWORD}"
  MYSQL_ROOT_PASSWORD: "${MYSQL_ROOT_PASSWORD}"
  REDIS_PASSWORD: "${REDIS_PASSWORD}"
  GJP_SECRET: "${GJP_SECRET}"
  XOR_KEY: "${XOR_KEY}"
  ADMIN_EMAIL: "${ADMIN_EMAIL}"
EOF
"""

                        // Deploy the application
                        sh """
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${APP_NAME}
  namespace: ${targetNamespace}
  labels:
    app: ${APP_NAME}
    version: "${IMAGE_TAG}"
    runtime: "${params.RUNTIME}"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${APP_NAME}
  template:
    metadata:
      labels:
        app: ${APP_NAME}
        version: "${IMAGE_TAG}"
        runtime: "${params.RUNTIME}"
    spec:
      containers:
      - name: ${APP_NAME}
        image: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${imageTag}
        ports:
        - containerPort: 3010
          name: http
        env:
        - name: PORT
          value: "3010"
        envFrom:
        - configMapRef:
            name: ${APP_NAME}-config
        - secretRef:
            name: ${APP_NAME}-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3010
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3010
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: gdps-data
          mountPath: /app/GDPS_DATA
      volumes:
      - name: logs
        emptyDir: {}
      - name: gdps-data
        persistentVolumeClaim:
          claimName: ${APP_NAME}-data
EOF
"""

                        // Create PVC for persistent data
                        sh """
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${APP_NAME}-data
  namespace: ${targetNamespace}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
EOF
"""

                        // Create Service
                        sh """
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: ${APP_NAME}
  namespace: ${targetNamespace}
  labels:
    app: ${APP_NAME}
spec:
  ports:
  - port: 80
    targetPort: 3010
    protocol: TCP
    name: http
  selector:
    app: ${APP_NAME}
EOF
"""

                        // Create Ingress
                        def domainSuffix = params.DEPLOYMENT_TARGET == 'production' ? '' : "-${params.DEPLOYMENT_TARGET}"
                        def fullDomain = "${params.DEPLOYMENT_TARGET == 'production' ? 'gdps' : params.DEPLOYMENT_TARGET + '-gdps'}.forever-gdps.host"
                        
                        sh """
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${APP_NAME}
  namespace: ${targetNamespace}
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  tls:
  - hosts:
    - "${fullDomain}"
    secretName: ${APP_NAME}-tls
  rules:
  - host: "${fullDomain}"
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${APP_NAME}
            port:
              number: 80
EOF
"""
                    }
                }
            }
        }

        stage('Wait for Deployment') {
            steps {
                container('kubectl') {
                    script {
                        def targetNamespace = "${NAMESPACE}-${params.DEPLOYMENT_TARGET}"
                        
                        sh """
                        echo '>>> Waiting for deployment to be ready...'
                        kubectl rollout status deployment/${APP_NAME} -n ${targetNamespace} --timeout=300s
                        
                        echo '>>> Checking pod status...'
                        kubectl get pods -n ${targetNamespace} -l app=${APP_NAME}
                        
                        echo '>>> Checking service endpoints...'
                        kubectl get endpoints -n ${targetNamespace} ${APP_NAME}
                        """
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                container('kubectl') {
                    script {
                        def targetNamespace = "${NAMESPACE}-${params.DEPLOYMENT_TARGET}"
                        def fullDomain = "${params.DEPLOYMENT_TARGET == 'production' ? 'gdps' : params.DEPLOYMENT_TARGET + '-gdps'}.forever-gdps.host"
                        
                        sh """
                        echo '>>> Running health checks...'
                        
                        # Wait a bit for the service to be fully ready
                        sleep 30
                        
                        # Check internal service health
                        kubectl run health-check-${BUILD_NUMBER} --rm -i --restart=Never --image=curlimages/curl -- \\
                          curl -f --max-time 30 http://${APP_NAME}.${targetNamespace}.svc.cluster.local/ || exit 1
                        
                        echo '>>> Health check completed successfully!'
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed'
            
            // Clean up temporary resources
            container('kubectl') {
                script {
                    sh '''
                    # Clean up any health check pods that might be left
                    kubectl delete pods -l run=health-check-${BUILD_NUMBER} --ignore-not-found=true || true
                    '''
                }
            }
        }
        
        success {
            script {
                def targetNamespace = "${NAMESPACE}-${params.DEPLOYMENT_TARGET}"
                def fullDomain = "${params.DEPLOYMENT_TARGET == 'production' ? 'gdps' : params.DEPLOYMENT_TARGET + '-gdps'}.forever-gdps.host"
                
                echo """
🎉 ForeverCore GDPS deployed successfully!

📊 Deployment Details:
   • Environment: ${params.DEPLOYMENT_TARGET}
   • Runtime: ${params.RUNTIME}
   • Image: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
   • Namespace: ${targetNamespace}
   • URL: https://${fullDomain}

🔧 Build Information:
   • Build: #${BUILD_NUMBER}
   • Commit: ${GIT_COMMIT_SHORT}
   • Time: ${BUILD_TIME}
"""
            }
        }
        
        failure {
            echo '❌ Pipeline failed'
            
            // Collect debug information
            container('kubectl') {
                script {
                    def targetNamespace = "${NAMESPACE}-${params.DEPLOYMENT_TARGET}"
                    
                    sh """
                    echo '>>> Collecting debug information...'
                    kubectl get all -n ${targetNamespace} || true
                    kubectl describe deployment ${APP_NAME} -n ${targetNamespace} || true
                    kubectl logs -l app=${APP_NAME} -n ${targetNamespace} --tail=50 || true
                    """
                }
            }
        }
        
        unstable {
            echo '⚠️  Pipeline completed with warnings'
        }
    }
}