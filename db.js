const mysql = require('mysql2/promise');

const requiredSettings = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingSettings = requiredSettings.filter((setting) => !process.env[setting]);
if (missingSettings.length) {
  throw new Error(`Missing MySQL environment variables: ${missingSettings.join(', ')}`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

const initPromise = pool.execute(`
  CREATE TABLE IF NOT EXISTS images (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255),
    mimetype VARCHAR(100),
    data LONGBLOB NOT NULL,
    size INT UNSIGNED,
    width INT UNSIGNED,
    height INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (created_at)
  )
`).then(() => undefined);

async function query(sql, values = []) {
  await initPromise;
  return pool.execute(sql, values);
}

function insertImage({ filename, mimetype, data, size, width, height }) {
  return query(
    'INSERT INTO images (filename, mimetype, data, size, width, height) VALUES (?, ?, ?, ?, ?, ?)',
    [filename, mimetype, data, size, width, height]
  ).then(([result]) => ({ id: result.insertId }));
}

async function getImages() {
  const [rows] = await query(
    'SELECT id, filename, mimetype, size, width, height, created_at FROM images ORDER BY created_at DESC'
  );
  return rows;
}

async function getImageById(id) {
  const [rows] = await query(
    'SELECT id, filename, mimetype, data, size, width, height, created_at FROM images WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function deleteImage(id) {
  const [result] = await query('DELETE FROM images WHERE id = ?', [id]);
  return { deleted: result.affectedRows > 0 };
}

module.exports = {
  insertImage,
  getImages,
  getImageById,
  deleteImage
};
