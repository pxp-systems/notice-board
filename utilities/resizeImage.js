const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = function(app) {
    app.get('/', (req, res) => {
        const dir = path.join(__dirname, '../public/uploads');
        fs.readdir(dir, (err, files) => {
            if (err) {
                console.error(err);
                res.status(500).send('An error occurred');
                return;
            }
            const images = files.filter(file => !/(^|\/)\.[^\/\.]/g.test(file));
            res.render('index', { images });
        });
    });
};
