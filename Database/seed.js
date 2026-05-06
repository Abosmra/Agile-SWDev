const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./app.db');

const dbFolder = path.join(__dirname, '../Database');

fs.readdirSync(dbFolder).forEach(file => {
  if (file.endsWith('.sql')) {
    const sql = fs.readFileSync(path.join(dbFolder, file), 'utf-8');
    
    db.exec(sql, (err) => {
      if (err) {
        console.error(`Error in ${file}:`, err.message);
      } else {
        console.log(`${file} executed successfully`);
      }
    });
  }
});