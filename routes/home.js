const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');



module.exports = function(app) {
    app.get('/', (req, res) => {
        // Define the directory path using DISPLAY_DIRECTORY from .env or a default
        dotenv.config();
        const dir = path.join(__dirname, '..', process.env.DISPLAY_DIRECTORY || 'public/uploads');
        //console.log(dir);
        // Check if directory exists first
        if (!fs.existsSync(dir)) {
            console.error(`The directory ${dir} does not exist.`);
            // Optionally, create the directory here or just return an error message
            // fs.mkdirSync(dir, { recursive: true });
            return res.status(500).send('Directory does not exist');
        }

        fs.readdir(dir, (err, files) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Failed to read directory');
            }
            const images = files.filter(file => !/(^|\/)\.[^\/\.]/g.test(file));
            const imagesWithDirectory = images.map(image => process.env.DISPLAY_DIRECTORY + '/' + image);

            res.render('index', { images: imagesWithDirectory });        });
    });
};
