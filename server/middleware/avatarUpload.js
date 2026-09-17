const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ensure avatars upload directory exists
const avatarUploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(avatarUploadDir)) {
      fs.mkdirSync(avatarUploadDir, { recursive: true });
    }
    cb(null, avatarUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// File filter: images only (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp/;
  const ext = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mime = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP) are allowed for profile photos.'));
  }
};

const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter,
});

module.exports = avatarUpload;
