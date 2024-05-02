const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = function(app) {
    // Route to list all images in the directory
    app.get('/images', (req, res) => {
        const directoryPath = process.env.DISPLAY_DIRECTORY || 'uploads';
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return res.status(500).send('Unable to scan directory: ' + err);
            }
            const filePaths = files.map(file => path.join(directoryPath, file));
            res.json(filePaths);
        });
    });

    // Route to delete images
    app.post('/delete-images', (req, res) => {
        const { selectedImages, password } = req.body;

        // Check if the password is correct
        if (password !== process.env.PASSWORD) {
            return res.status(401).send("Unauthorized: Incorrect Password");
        }

        const directoryPath = path.join(__dirname, '..', process.env.DISPLAY_DIRECTORY || 'uploads');
        selectedImages.forEach((imageUrl, index) => {
            const imageName = imageUrl.split('/').pop();
            fs.unlink(path.join(directoryPath, imageName), err => {
                if (err) {
                    console.error(`Failed to delete ${imageName}`, err);
                    return res.status(500).send({ message: `Failed to delete image ${imageName}` });
                }

                // Check if it's the last image in the loop to send a response
                if (index === selectedImages.length - 1) {
                    res.status(200).send({ message: 'Images deleted successfully' });
                }
            });
        });
    });
};
