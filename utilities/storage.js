const multer = require('multer');
const fs = require('fs');
const path = require('path');

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = process.env.DISPLAY_DIRECTORY || 'uploads';
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

module.exports = { diskStorage };
