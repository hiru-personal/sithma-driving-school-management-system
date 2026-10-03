const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ensure Final Licenses upload directory exists
const finalLicenseUploadDir = path.join(__dirname, '..', 'uploads', 'final_licenses');
if (!fs.existsSync(finalLicenseUploadDir)) {
  fs.mkdirSync(finalLicenseUploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(finalLicenseUploadDir)) {
      fs.mkdirSync(finalLicenseUploadDir, { recursive: true });
    }
    cb(null, finalLicenseUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const studentId = req.params?.id || 'student';
    const uniqueName = `license-${studentId}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter: jpg, jpeg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp/;
  const ext = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mime = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, JPEG, PNG, WEBP) are allowed for the Driving License Photo.'));
  }
};

const finalLicenseUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max file size
  fileFilter,
});

module.exports = finalLicenseUpload;
