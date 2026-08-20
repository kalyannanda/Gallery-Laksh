const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'gallery.db');
const db = new sqlite3.Database(DB_PATH);

// Initialize table
const initSql = `
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  mimetype TEXT,
  data BLOB,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.serialize(() => {
  db.run(initSql);
});

function insertImage({ filename, mimetype, data, size, width, height }) {
  return new Promise((resolve, reject) => {
    const stmt = `INSERT INTO images (filename, mimetype, data, size, width, height) VALUES (?,?,?,?,?,?)`;
    db.run(stmt, [filename, mimetype, data, size, width, height], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

function getImages() {
  return new Promise((resolve, reject) => {
    const q = `SELECT id, filename, mimetype, size, width, height, created_at FROM images ORDER BY created_at DESC`;
    db.all(q, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getImageById(id) {
  return new Promise((resolve, reject) => {
    const q = `SELECT id, filename, mimetype, data, size, width, height, created_at FROM images WHERE id = ?`;
    db.get(q, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function deleteImage(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM images WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve({ deleted: this.changes > 0 });
    });
  });
}

module.exports = {
  db,
  insertImage,
  getImages,
  getImageById,
  deleteImage
};
