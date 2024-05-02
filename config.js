const express = require('express');
const path = require('path');

function configure(app) {
    app.use(express.json()); 
    app.use(express.static('public'));
    app.set('view engine', 'ejs');
    app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));
    require('dotenv').config();
}

module.exports = { configure };
