#!/bin/bash

# Script to update all GD routes to use dynamic GDPS databases

files=(
  "src/routes/gd/accounts.ts"
  "src/routes/gd/comments.ts" 
  "src/routes/gd/social.ts"
  "src/routes/gd/songs.ts"
  "src/routes/gd/daily.ts"
  "src/routes/gd/lists.ts"
)

for file in "${files[@]}"; do
  echo "Updating $file..."
  
  # Add imports
  sed -i '/import { generateGDHash }/a import { extractGdpsId, getRequestGdpsDb } from '\''../../utils/gdps-middleware.js'\'';' "$file"
  sed -i '/import { generateGDHash }/a import { checkRateLimit, getChestConfig } from '\''../../services/gdps-config.js'\'';' "$file"
  
  # Replace fastify.db with dynamic db calls
  sed -i 's/fastify\.db/db/g' "$file"
  
  # Add GDPS ID extraction and db initialization to each route
  sed -i '/const body = request\.body as any;/a\\n    const gdpsId = await extractGdpsId(request);\n    if (!gdpsId) {\n      return '\''-1'\'';\n    }\n\n    const db = fastify.getGdpsDb(gdpsId);' "$file"
  
done

echo "Routes updated!"