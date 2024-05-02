const sharp = require('sharp');

function resizeImage(req, res, next) {
    if (!req.file) {
        next();
        return;
    }
    const targetWidth = 1024;
    const targetHeight = 768;
    sharp(req.file.buffer)
        .resize(targetWidth, targetHeight, { fit: sharp.fit.inside })
        .toBuffer()
        .then(resizedBuffer => {
            req.file.buffer = resizedBuffer;
            req.file.size = resizedBuffer.length;
            next();
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong with image resizing!');
        });
}

module.exports = resizeImage;
