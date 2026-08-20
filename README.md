# Laksh Gallery

A simple gallery app (Node + Express) that stores uploaded images as BLOBs in a MySQL database.

How to run locally

1. Clone the repo
   
   git clone https://github.com/kalyannanda/laksh-gallery.git
   cd laksh-gallery

2. Install dependencies

   npm install

3. Start the server

   npm start

4. Open http://localhost:3000

## GoDaddy MySQL setup

1. In GoDaddy cPanel, create a MySQL database and database user. Add the user to the database with all required privileges.
2. Open phpMyAdmin for that database and run this SQL (the application can also create the table automatically):

```sql
CREATE TABLE images (
   id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
   filename VARCHAR(255),
   mimetype VARCHAR(100),
   data LONGBLOB NOT NULL,
   size INT UNSIGNED,
   width INT UNSIGNED,
   height INT UNSIGNED,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   INDEX (created_at)
);
```

3. Configure these environment variables in the GoDaddy Node.js application settings. GoDaddy commonly prefixes the database name and username with the cPanel account name, so use the exact values shown in cPanel:

```text
DB_HOST=your-GoDaddy-MySQL-host
DB_PORT=3306
DB_NAME=your-cPanel-database-name
DB_USER=your-cPanel-database-user
DB_PASSWORD=your-database-password
```

4. Set the application startup file to `server.js`, run `npm install`, and start or restart the Node.js application. Your domain root will serve `public/index.html`.

Notes:
- No SQLite file is used. Do not upload `gallery.db`.
- Supported image types: JPEG, PNG, WebP.
- Max file size: 20 MB (configured in `server.js` via multer).
