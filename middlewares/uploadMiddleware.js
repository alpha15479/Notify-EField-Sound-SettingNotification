const multer = require('multer');
const upload = multer();

const uploadMiddleware = (req, res, next) => {
  upload.single('fileName')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size limit exceeded' });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

module.exports = { uploadMiddleware };