# Kubernetes Deployment Guide

## Prerequisites

Before running the Jenkins pipeline, ensure the following resources are set up in your Kubernetes cluster:

### 1. Apply RBAC Configuration

```bash
# Create namespaces
kubectl apply -f k8s/namespaces.yaml

# Create Jenkins service account and RBAC permissions
kubectl apply -f k8s/jenkins-rbac.yaml
```

### 2. Verify Permissions

```bash
# Check if Jenkins service account has correct permissions
kubectl auth can-i get pods -n gdps-development --as=system:serviceaccount:jenkins:jenkins-agent-sa
kubectl auth can-i create deployments -n gdps-development --as=system:serviceaccount:jenkins:jenkins-agent-sa
kubectl auth can-i create ingresses -n gdps-development --as=system:serviceaccount:jenkins:jenkins-agent-sa
```

### 3. Jenkins Agent Configuration

Ensure your Jenkins Kubernetes plugin uses the service account:

```yaml
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins-agent-sa
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
  - name: kubectl
    image: alpine/k8s:1.30.12
```

## Troubleshooting

### Permission Errors

If you see errors like:
```
Error from server (Forbidden): replicationcontrollers is forbidden
```

1. Verify the service account exists:
   ```bash
   kubectl get serviceaccount jenkins-agent-sa -n jenkins
   ```

2. Check RBAC bindings:
   ```bash
   kubectl get clusterrolebinding jenkins-deployment-binding
   kubectl get rolebinding jenkins-gdps-development -n gdps-development
   ```

3. Re-apply RBAC configuration:
   ```bash
   kubectl apply -f k8s/jenkins-rbac.yaml
   ```

### Namespace Issues

If namespaces are not found:
```bash
kubectl apply -f k8s/namespaces.yaml
```

### Jenkins Pipeline Debugging

The pipeline includes comprehensive error collection that will show:
- Pod status and logs
- Deployment status
- Service endpoints
- ConfigMap and Secret status

## Manual Deployment

For manual deployment without Jenkins:

```bash
# 1. Create namespaces and RBAC
kubectl apply -f k8s/namespaces.yaml
kubectl apply -f k8s/jenkins-rbac.yaml

# 2. Build images (using Docker)
docker build -t forevercore-gdps:latest .
docker build -t forevercore-gdps-admin:latest ./panelui

# 3. Deploy using kubectl with environment substitution
export IMAGE_TAG=latest
export NAMESPACE=gdps-development
envsubst < k8s/deployment.yaml | kubectl apply -f -
```

## Production Considerations

1. **Secrets Management**: Store sensitive data in Kubernetes secrets or external secret managers
2. **Resource Limits**: Adjust CPU/memory limits based on load testing
3. **Ingress Controllers**: Ensure nginx-ingress and cert-manager are installed
4. **Monitoring**: Set up Prometheus and Grafana for monitoring
5. **Backup**: Configure regular backups for persistent volumes