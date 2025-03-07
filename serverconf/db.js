const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

let parsedYaml = {};

try {
    const yamlPath = path.join(__dirname, '../config/db.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents);
} catch (error) {
    console.error("Error loading DB settings:", error);
}

const db = mysql.createPool({
    host: parsedYaml.host,
    user: parsedYaml.user,
    password: parsedYaml.password,
    database: parsedYaml.database
});

module.exports = db;
