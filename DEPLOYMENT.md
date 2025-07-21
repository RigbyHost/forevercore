# ForeverCore GDPS - Deployment Guide

This guide covers deployment options for ForeverCore GDPS using Docker and Kubernetes.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Kubernetes cluster (for production)
- Jenkins (for CI/CD)
- MySQL 8.0+
- Redis 7+ (optional, for caching)

### Environment Variables

Copy `.env.example` to `.env` and configure your environment:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f forevercore

# Stop services
docker-compose down
```

Services available:
- **ForeverCore GDPS**: http://localhost:3010
- **phpMyAdmin**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_USER` | MySQL username | `gdps` |
| `DB_PASSWORD` | MySQL password | **Required** |
| `DB_NAME` | MySQL database | `gdps` |
| `GJP_SECRET` | GJP password hashing secret | **Auto-generated** |
| `XOR_KEY` | XOR encryption key for GD data | **Auto-generated** |

### Optional Features

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_ENABLED` | Enable Redis caching | `false` |
| `YOUTUBE_API_KEY` | YouTube API for music | - |
| `AWS_ACCESS_KEY_ID` | AWS S3 integration | - |
| `ENABLE_REGISTRATION` | Allow new registrations | `true` |

## 🐳 Docker Deployment

### Single Container

```bash
# Build the image
docker build -t forevercore-gdps .

# Run with Node.js
docker run -d \
  --name forevercore \
  -p 3010:3010 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  forevercore-gdps

# Run with Bun (faster startup)
docker build -t forevercore-gdps:bun --target bun-production .
docker run -d \
  --name forevercore-bun \
  -p 3010:3010 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  forevercore-gdps:bun
```

### Production with Docker Compose

```bash
# Copy and configure production environment
cp .env.example .env.production

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# With Bun runtime
docker-compose -f docker-compose.prod.yml --profile bun up -d
```

## ☸️ Kubernetes Deployment

### Manual Deployment

1. **Create namespace:**
```bash
kubectl create namespace gdps
```

2. **Create secrets:**
```bash
kubectl create secret generic forevercore-secrets \
  --from-literal=DB_PASSWORD=your-password \
  --from-literal=JWT_SECRET=your-jwt-secret \
  --from-literal=ENCRYPTION_KEY=your-encryption-key \
  -n gdps
```

3. **Deploy application:**
```bash
kubectl apply -f k8s/ -n gdps
```

### CI/CD with Jenkins

The project includes a comprehensive Jenkinsfile for automated deployment:

1. **Configure Jenkins credentials:**
   - `gdps-db-password`
   - `mysql-root-password` 
   - `redis-password`
   - `gdps-gjp-secret`
   - `gdps-xor-key`
   - `gdps-admin-email`

2. **Pipeline parameters:**
   - **Deployment Target**: `development`, `staging`, `production`
   - **Runtime**: `node`, `bun`
   - **Run Tests**: Enable/disable testing
   - **Skip Cache**: Force Docker rebuild

3. **Pipeline stages:**
   - Checkout & Environment Setup
   - Dependency Installation
   - Testing (TypeScript, Linting, Unit Tests)
   - Docker Image Building (Node.js/Bun)
   - Kubernetes Deployment
   - Health Checks

## 🔍 Monitoring & Logging

### Health Checks

- **HTTP**: `GET /` (basic health check)
- **Database**: Connection verification
- **Redis**: Cache availability (if enabled)

### Logging

Logs are available at:
- **Container**: `/app/logs/`
- **Kubernetes**: `kubectl logs -l app=forevercore`

### Metrics

The application exposes metrics for monitoring:
- Response times
- Request rates
- Error rates
- Database connection pool status
- Cache hit rates (if Redis enabled)

## 🛡️ Security

### Network Security

- HTTPS enforcement via Nginx
- Rate limiting on API endpoints
- Request size limits
- Timeout configurations

### Data Security

- Environment variable encryption
- Database password protection
- JWT token security
- Input sanitization and validation

### Container Security

- Non-root user execution
- Minimal base images
- Security scanning in CI/CD
- Resource limits and quotas

## 🚨 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check database connectivity
   kubectl exec -it deployment/forevercore -- nc -zv mysql 3306
   ```

2. **Redis connection issues**
   ```bash
   # Test Redis connection
   kubectl exec -it deployment/forevercore -- nc -zv redis 6379
   ```

3. **High memory usage**
   ```bash
   # Check resource usage
   kubectl top pods -l app=forevercore
   ```

### Debug Commands

```bash
# View application logs
kubectl logs -l app=forevercore --tail=100

# Access container shell
kubectl exec -it deployment/forevercore -- /bin/sh

# Check configuration
kubectl describe configmap forevercore-config

# View events
kubectl get events --sort-by=.metadata.creationTimestamp
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale application pods
kubectl scale deployment forevercore --replicas=3

# Auto-scaling based on CPU
kubectl autoscale deployment forevercore --cpu-percent=70 --min=2 --max=10
```

### Database Scaling

- **Read Replicas**: Configure MySQL read replicas for better performance
- **Connection Pooling**: Adjust `DB_CONNECTION_LIMIT` based on load
- **Caching**: Enable Redis for improved response times

## 🔄 Backup & Recovery

### Database Backups

Automated backups are available:

```bash
# Manual backup
docker-compose -f docker-compose.prod.yml run --rm db-backup

# Restore from backup
mysql -h mysql -u gdps -p gdps < backup_file.sql
```

### Persistent Data

Important directories to backup:
- `/app/GDPS_DATA/` - GDPS game data
- `/app/logs/` - Application logs
- MySQL data volume

## 🎯 Performance Optimization

### Application Tuning

- **Runtime**: Bun provides ~2x faster startup times
- **Memory**: Adjust container limits based on usage
- **Connection Pooling**: Tune database connections
- **Caching**: Enable Redis for frequently accessed data

### Infrastructure Tuning

- **Resource Limits**: Set appropriate CPU/memory limits
- **Node Affinity**: Place database and app on same nodes
- **Storage**: Use SSD for database volumes
- **Network**: Optimize ingress controller settings

## 📞 Support

For deployment issues:

1. Check this deployment guide
2. Review application logs
3. Verify environment configuration
4. Test database connectivity
5. Check Kubernetes events and pod status

---

**Note**: This deployment guide assumes basic knowledge of Docker, Kubernetes, and containerized applications. For complex production deployments, consider consulting with a DevOps engineer.