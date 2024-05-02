const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const resizeImage = require('../utilities/resizeImage');
const storage = require('../utilities/storage');

const upload = multer({ storage: storage.diskStorage });

module.exports = function(app) {
    // Route to display the upload form
    app.get('/upload', (req, res) => {
        res.render('upload', { title: 'Upload Image' });
    });

    // Route to handle the image upload
    app.post('/upload', upload.single('image'), resizeImage, (req, res) => {
        // Ensure a file was uploaded
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Check if the password is correct
        const { password } = req.body;
        if (password !== process.env.PASSWORD) {
            console.log("Incorrect password...")
            return res.status(401).send('Incorrect password.');
        }

        // Upload to the desired target folder
        const directoryPath = process.env.DISPLAY_DIRECTORY || 'uploads';
        const targetPath = path.join(__dirname, '..', directoryPath);

        // Create the target folder if not already existent
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath);
        }

        // Save the resized image to the disk
        fs.writeFileSync(path.join(targetPath, req.file.originalname), req.file.buffer);

        // Send the response to the client
        res.status(200).send('Image upload successful');
    });
};
