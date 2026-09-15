const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ensure clearance proofs upload directory exists
const clearanceUploadDir = path.join(__dirname, '..', 'uploads', 'clearance_proofs');
if (!fs.existsSync(clearanceUploadDir)) {
  fs.mkdirSync(clearanceUploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(clearanceUploadDir)) {
      fs.mkdirSync(clearanceUploadDir, { recursive: true });
    }
    cb(null, clearanceUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `clearance-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter: jpg, jpeg, png, webp, pdf
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp|pdf/;
  const ext = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mime = /image\/(jpeg|jpg|png|webp)|application\/pdf/.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP) or PDF documents are allowed as proof of DMT clearance.'));
  }
};

const clearanceUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter,
});

module.exports = clearanceUpload;
