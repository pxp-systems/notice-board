const express = require('express');
const app = express();
const { configure } = require('./config');
const path = require('path');
//app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Basic server setup
configure(app);
require('./routes/home')(app);
require('./routes/upload')(app);
require('./routes/directory')(app);
require('./routes/images')(app);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
