const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

module.exports = function(app) {
    // Endpoint to set the directory in the .env file
    app.post('/set-directory', (req, res) => {
        const { directory } = req.body;

        // Construct the path to the .env file
        const envPath = path.join(__dirname, '..', '.env');

        // Read and parse existing settings from the .env file
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        envConfig.DISPLAY_DIRECTORY = directory;  // Update the directory
        const newEnvContent = Object.keys(envConfig).map(key => `${key}=${envConfig[key]}`).join('\n');

        // Write the updated settings back to the .env file
        fs.writeFileSync(envPath, newEnvContent);

        // Update in-memory environment variables
        process.env.DISPLAY_DIRECTORY = directory;

        res.json({ message: 'Directory set successfully in .env to ' + directory });
    });
};
