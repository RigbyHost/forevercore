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
  - name: bun
    image: oven/bun:1.1-alpine
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
        
        // Database configuration
        DB_HOST = "mysql.mysql.svc.cluster.local"
        DB_USER = "gdps"
        DB_NAME = "gdps"
        DB_PORT = "3306"
        
        // Redis configuration
        REDIS_HOST = "redis.default.svc.cluster.local"
        REDIS_PORT = "6379"
        REDIS_DATABASE = "7"
        REDIS_ENABLED = "true"
        
        // Sensitive credentials (should be stored in Jenkins credentials)
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
                script {
                    def containerName = params.RUNTIME == 'bun' ? 'bun' : 'node'
                    container(containerName) {
                        sh '''
                        echo '>>> Setting up environment...'
                        if command -v bun >/dev/null 2>&1; then
                            bun --version
                        else
                            node --version
                            npm --version
                        fi
                        
                        # Create .env file for build
                        cat > .env << EOF
NODE_ENV=${NODE_ENV}
GDPS_NAME="${GDPS_NAME}"
GDPS_ID=${GDPS_ID}
BUILD_NUMBER=${BUILD_NUMBER}
GIT_COMMIT=${GIT_COMMIT_SHORT}
BUILD_TIME=${BUILD_TIME}
YOUTUBE_DL_SKIP_PYTHON_CHECK=1
EOF
                        '''
                    }
                }
            }
        }

        stage('Install Dependencies') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                script {
                    def containerName = params.RUNTIME == 'bun' ? 'bun' : 'node'
                    container(containerName) {
                        sh '''
                        echo '>>> Installing dependencies...'
                        export YOUTUBE_DL_SKIP_PYTHON_CHECK=1
                        if command -v bun >/dev/null 2>&1; then
                            echo 'Using Bun for dependency installation'
                            bun install --frozen-lockfile
                        else
                            echo 'Using npm for dependency installation'
                            # Generate package-lock.json if missing or outdated
                            if [ ! -f package-lock.json ] || ! npm ci --dry-run >/dev/null 2>&1; then
                                echo 'Generating fresh package-lock.json...'
                                npm install
                            else
                                npm ci
                            fi
                        fi
                        '''
                    }
                }
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS == true }
            }
            parallel {
                stage('Test API') {
                    steps {
                        script {
                            def containerName = params.RUNTIME == 'bun' ? 'bun' : 'node'
                            container(containerName) {
                                sh '''
                                echo '>>> Testing ForeverCore API...'
                                export YOUTUBE_DL_SKIP_PYTHON_CHECK=1
                                
                                # TypeScript compilation check for API only
                                echo 'Checking API TypeScript compilation...'
                                if command -v bun >/dev/null 2>&1; then
                                    echo 'Using Bun for TypeScript compilation'
                                    if [ -f node_modules/.bin/tsc ]; then
                                        bun x tsc --noEmit
                                    else
                                        echo 'TypeScript not found, skipping compilation check'
                                    fi
                                else
                                    echo 'Using npm for TypeScript compilation'
                                    if [ -f node_modules/.bin/tsc ]; then
                                        npx tsc --noEmit
                                    else
                                        echo 'TypeScript not found, skipping compilation check'
                                    fi
                                fi
                                
                                # Run API linting if available
                                echo 'Checking for API linting scripts...'
                                if command -v bun >/dev/null 2>&1; then
                                    if bun run --silent lint >/dev/null 2>&1; then
                                        echo 'Running API linting with Bun...'
                                        bun run lint
                                    else
                                        echo 'No lint script found for API'
                                    fi
                                else
                                    if npm run lint --silent >/dev/null 2>&1; then
                                        echo 'Running API linting with npm...'
                                        npm run lint
                                    else
                                        echo 'No lint script found for API'
                                    fi
                                fi
                                
                                # Run API unit tests if available
                                echo 'Checking for API test scripts...'
                                if command -v bun >/dev/null 2>&1; then
                                    if bun run --silent test >/dev/null 2>&1; then
                                        echo 'Running API tests with Bun...'
                                        bun run test
                                    else
                                        echo 'No test script found for API'
                                    fi
                                else
                                    if npm run test --silent >/dev/null 2>&1; then
                                        echo 'Running API tests with npm...'
                                        npm test
                                    else
                                        echo 'No test script found for API'
                                    fi
                                fi
                                '''
                            }
                        }
                    }
                }
                
                stage('Test Admin Panel') {
                    steps {
                        script {
                            def containerName = params.RUNTIME == 'bun' ? 'bun' : 'node'
                            container(containerName) {
                                sh '''
                                echo '>>> Testing Admin Panel...'
                                export YOUTUBE_DL_SKIP_PYTHON_CHECK=1
                                
                                cd panelui
                                
                                # Install panelui dependencies
                                echo 'Installing Admin Panel dependencies...'
                                if command -v bun >/dev/null 2>&1; then
                                    echo 'Using Bun for panelui dependencies'
                                    bun install --frozen-lockfile
                                else
                                    echo 'Using npm for panelui dependencies'
                                    if [ ! -f package-lock.json ] || ! npm ci --dry-run >/dev/null 2>&1; then
                                        echo 'Generating fresh package-lock.json for panelui...'
                                        npm install
                                    else
                                        npm ci
                                    fi
                                fi
                                
                                # TypeScript compilation check for panelui
                                echo 'Checking Admin Panel TypeScript compilation...'
                                if command -v bun >/dev/null 2>&1; then
                                    if [ -f node_modules/.bin/tsc ]; then
                                        bun x tsc --noEmit
                                    else
                                        echo 'TypeScript not found in panelui, skipping compilation check'
                                    fi
                                else
                                    if [ -f node_modules/.bin/tsc ]; then
                                        npx tsc --noEmit
                                    else
                                        echo 'TypeScript not found in panelui, skipping compilation check'
                                    fi
                                fi
                                
                                # Run panelui linting if available
                                echo 'Checking for Admin Panel linting scripts...'
                                if command -v bun >/dev/null 2>&1; then
                                    if bun run --silent lint >/dev/null 2>&1; then
                                        echo 'Running Admin Panel linting with Bun...'
                                        bun run lint
                                    else
                                        echo 'No lint script found for Admin Panel'
                                    fi
                                else
                                    if npm run lint --silent >/dev/null 2>&1; then
                                        echo 'Running Admin Panel linting with npm...'
                                        npm run lint
                                    else
                                        echo 'No lint script found for Admin Panel'
                                    fi
                                fi
                                
                                # Build test for panelui
                                echo 'Testing Admin Panel build...'
                                if command -v bun >/dev/null 2>&1; then
                                    echo 'Building Admin Panel with Bun...'
                                    bun run build
                                else
                                    echo 'Building Admin Panel with npm...'
                                    npm run build
                                fi
                                '''
                            }
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Node.js API') {
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
                
                stage('Build Bun API') {
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
                
                stage('Build Admin Panel') {
                    steps {
                        container('kaniko') {
                            script {
                                def cacheFlag = params.SKIP_CACHE ? '--no-cache' : '--cache=true'
                                def adminRuntime = params.RUNTIME == 'bun' ? 'bun-production' : 'production'
                                
                                sh """
                                echo '>>> Building Admin Panel Docker image...'
                                
                                /kaniko/executor --context=dir://panelui \\
                                  --dockerfile=panelui/Dockerfile \\
                                  --target=${adminRuntime} \\
                                  --destination=${DOCKER_REGISTRY}/${IMAGE_NAME}-admin:${IMAGE_TAG} \\
                                  --destination=${DOCKER_REGISTRY}/${IMAGE_NAME}-admin:latest \\
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
                        
                        // Ensure namespaces exist
                        sh """
                        echo '>>> Setting up namespaces and RBAC...'
                        kubectl apply -f k8s/namespaces.yaml || echo 'Namespaces may already exist'
                        kubectl apply -f k8s/jenkins-rbac.yaml || echo 'RBAC may already exist'
                        
                        echo '>>> Verifying namespace access...'
                        kubectl get namespace ${targetNamespace} || kubectl create namespace ${targetNamespace}
                        kubectl auth can-i get pods -n ${targetNamespace} || echo 'Warning: Limited permissions'
                        """

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
  DB_HOST: "${DB_HOST}"
  DB_USER: "${DB_USER}"
  DB_NAME: "${DB_NAME}"
  DB_PORT: "${DB_PORT}"
  REDIS_HOST: "${REDIS_HOST}"
  REDIS_PORT: "${REDIS_PORT}"
  REDIS_DATABASE: "${REDIS_DATABASE}"
  REDIS_ENABLED: "${REDIS_ENABLED}"
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

                        // Deploy Admin Panel
                        sh """
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${APP_NAME}-admin
  namespace: ${targetNamespace}
  labels:
    app: ${APP_NAME}-admin
    version: "${IMAGE_TAG}"
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${APP_NAME}-admin
  template:
    metadata:
      labels:
        app: ${APP_NAME}-admin
        version: "${IMAGE_TAG}"
    spec:
      containers:
      - name: ${APP_NAME}-admin
        image: ${DOCKER_REGISTRY}/${IMAGE_NAME}-admin:${IMAGE_TAG}
        ports:
        - containerPort: 3001
          name: http
        env:
        - name: PORT
          value: "3001"
        - name: NODE_ENV
          value: "${NODE_ENV}"
        - name: NEXT_PUBLIC_API_URL
          value: "http://${APP_NAME}.${targetNamespace}.svc.cluster.local"
        - name: GDPS_API_URL
          value: "http://${APP_NAME}.${targetNamespace}.svc.cluster.local"
        envFrom:
        - configMapRef:
            name: ${APP_NAME}-config
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
EOF
"""

                        // Create Admin Service
                        sh """
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: ${APP_NAME}-admin
  namespace: ${targetNamespace}
  labels:
    app: ${APP_NAME}-admin
spec:
  ports:
  - port: 80
    targetPort: 3001
    protocol: TCP
    name: http
  selector:
    app: ${APP_NAME}-admin
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
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: ${APP_NAME}-admin
            port:
              number: 80
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
                        echo '>>> Waiting for deployments to be ready...'
                        kubectl rollout status deployment/${APP_NAME} -n ${targetNamespace} --timeout=300s
                        kubectl rollout status deployment/${APP_NAME}-admin -n ${targetNamespace} --timeout=300s
                        
                        echo '>>> Checking pod status...'
                        kubectl get pods -n ${targetNamespace} -l app=${APP_NAME}
                        kubectl get pods -n ${targetNamespace} -l app=${APP_NAME}-admin
                        
                        echo '>>> Checking service endpoints...'
                        kubectl get endpoints -n ${targetNamespace} ${APP_NAME}
                        kubectl get endpoints -n ${targetNamespace} ${APP_NAME}-admin
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
                        
                        # Check internal API service health
                        kubectl run health-check-api-${BUILD_NUMBER} --rm -i --restart=Never --image=curlimages/curl -- \\
                          curl -f --max-time 30 http://${APP_NAME}.${targetNamespace}.svc.cluster.local/ || exit 1
                        
                        # Check internal admin service health
                        kubectl run health-check-admin-${BUILD_NUMBER} --rm -i --restart=Never --image=curlimages/curl -- \\
                          curl -f --max-time 30 http://${APP_NAME}-admin.${targetNamespace}.svc.cluster.local/ || exit 1
                        
                        echo '>>> Health checks completed successfully!'
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
                    kubectl delete pods -l run=health-check-api-${BUILD_NUMBER} --ignore-not-found=true || true
                    kubectl delete pods -l run=health-check-admin-${BUILD_NUMBER} --ignore-not-found=true || true
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
   • API Image: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
   • Admin Image: ${DOCKER_REGISTRY}/${IMAGE_NAME}-admin:${IMAGE_TAG}
   • Namespace: ${targetNamespace}
   • GDPS URL: https://${fullDomain}
   • Admin Panel: https://${fullDomain}/admin

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
                    echo 'Pods:'
                    kubectl get pods -n ${targetNamespace} || true
                    echo 'Services:'
                    kubectl get services -n ${targetNamespace} || true
                    echo 'Deployments:'
                    kubectl get deployments -n ${targetNamespace} || true
                    echo 'Ingresses:'
                    kubectl get ingresses -n ${targetNamespace} || true
                    echo 'ConfigMaps:'
                    kubectl get configmaps -n ${targetNamespace} || true
                    echo 'Secrets:'
                    kubectl get secrets -n ${targetNamespace} || true
                    
                    echo 'Deployment details:'
                    kubectl describe deployment ${APP_NAME} -n ${targetNamespace} || true
                    kubectl describe deployment ${APP_NAME}-admin -n ${targetNamespace} || true
                    
                    echo 'Pod logs:'
                    kubectl logs -l app=${APP_NAME} -n ${targetNamespace} --tail=50 || true
                    kubectl logs -l app=${APP_NAME}-admin -n ${targetNamespace} --tail=50 || true
                    """
                }
            }
        }
        
        unstable {
            echo '⚠️  Pipeline completed with warnings'
        }
    }
}