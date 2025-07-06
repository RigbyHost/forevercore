#!/bin/bash

# ForeverCore GDPS Database Backup Script
# This script creates automated backups of the MySQL database

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

# Database configuration from environment
DB_HOST=${MYSQL_HOST:-mysql}
DB_USER=${MYSQL_USER:-gdps}
DB_PASSWORD=${MYSQL_PASSWORD}
DB_NAME=${MYSQL_DATABASE:-gdps}

# Backup filename
BACKUP_FILE="${BACKUP_DIR}/gdps_backup_${TIMESTAMP}.sql"
COMPRESSED_BACKUP="${BACKUP_FILE}.gz"

echo "Starting database backup at $(date)"
echo "Database: ${DB_NAME}@${DB_HOST}"
echo "Backup file: ${COMPRESSED_BACKUP}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create the backup
echo "Creating database dump..."
mysqldump \
    --host="${DB_HOST}" \
    --user="${DB_USER}" \
    --password="${DB_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --databases "${DB_NAME}" > "${BACKUP_FILE}"

# Compress the backup
echo "Compressing backup..."
gzip "${BACKUP_FILE}"

# Verify the backup was created
if [ -f "${COMPRESSED_BACKUP}" ]; then
    BACKUP_SIZE=$(du -h "${COMPRESSED_BACKUP}" | cut -f1)
    echo "Backup completed successfully: ${COMPRESSED_BACKUP} (${BACKUP_SIZE})"
else
    echo "ERROR: Backup file was not created!"
    exit 1
fi

# Clean up old backups (keep only last N days)
echo "Cleaning up old backups (keeping last ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "gdps_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# List current backups
echo "Current backups:"
ls -lh "${BACKUP_DIR}"/gdps_backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo "Backup process completed at $(date)"