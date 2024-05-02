const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

module.exports = function(app) {
    // Endpoint to set the directory in the .env file
    app.post('/set-directory', (req, res) => {
        const { directory } = req.body;

        // Modify .env file logic
        const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')));
        envConfig.DISPLAY_DIRECTORY = directory;
        const newEnvContent = Object.keys(envConfig).map(key => `${key}=${envConfig[key]}`).join('\n');

        fs.writeFileSync(path.join(__dirname, '..', '.env'), newEnvContent);

        res.json({ message: 'Directory set successfully in .env to ' + directory });
    });
};
