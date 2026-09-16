const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ensure DMT proofs upload directory exists
const dmtProofUploadDir = path.join(__dirname, '..', 'uploads', 'dmt_proofs');
if (!fs.existsSync(dmtProofUploadDir)) {
  fs.mkdirSync(dmtProofUploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(dmtProofUploadDir)) {
      fs.mkdirSync(dmtProofUploadDir, { recursive: true });
    }
    cb(null, dmtProofUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const milestoneType = req.body?.milestoneType || 'milestone';
    const uniqueName = `dmt-${milestoneType}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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
    cb(new Error('Only image files (JPG, PNG, WEBP) or PDF documents are allowed as proof.'));
  }
};

const dmtProofUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max file size
  fileFilter,
});

module.exports = dmtProofUpload;
