# Laksh Gallery

A simple gallery app (Node + Express) that stores uploaded images as BLOBs in a local SQLite database.

How to run locally

1. Clone the repo
   
   git clone https://github.com/kalyannanda/laksh-gallery.git
   cd laksh-gallery

2. Install dependencies

   npm install

3. Start the server

   npm start

4. Open http://localhost:3000

Notes
- Uploaded images are stored in gallery.db (SQLite file) at the repository root.
- Supported image types: JPEG, PNG, WebP.
- Max file size: 20 MB (configured in server.js via multer). 
