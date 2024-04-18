const express = require('express');
const multer = require('multer');
//const upload = multer({ dest: 'uploads/' }); 
const path = require('path'); 
const sharp = require('sharp');
const fs = require('fs');
const app = express();

// Configure Multer Storage to resize the image
const storage = multer.memoryStorage();
const upload = multer({ storage });
// Middleware to resize the image
function resizeImage(req, res, next) {
    if (!req.file) {
      next();
    }
  
    const width = 1920;
    const height = 1080;
  
    // Keep aspect ratio
    let resizedWidth = width;
    let resizedHeight = height;
  
    if (req.file.buffer.length < 10485760) { // Limit resizing if file size is less than 10 MB (Adjust as needed)
      if (req.file.buffer.length > 1920 * 1080 * 3) {
        sharp(req.file.buffer)
          .resize(width, height)
          .toBuffer()
          .then((resizedBuffer) => {
            req.file.buffer = resizedBuffer;
            req.file.size = resizedBuffer.length;
            next();
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Something went wrong!');
          });
      } else {
        next();
      }
    } else {
      next();
    }
  }
  
  // Upload middleware handling the file and processing image
  app.post('/upload', upload.single('image'), resizeImage, (req, res) => {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    // Set the original filename before saving
    req.file.originalname = req.file.originalname;
  
    // Upload to the desired target folder
    const targetPath = path.join(__dirname, 'public/uploads');
  
    // Create the target folder if not already existent
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath);
    }
  
    fs.writeFileSync(path.join(targetPath, req.file.originalname), req.file.buffer);
  
    // Send the response to the client
    res.status(200).send('Image upload successful');
  });
  

app.post('/upload', upload.single('image'), (req, res) => {
    const tempPath = req.file.path;
    const targetPath1 = path.join(__dirname, 'public/uploads', req.file.originalname);
  
    fs.rename(tempPath, targetPath1, (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send('Image uploaded successfully');
    });
  });

// Serve static files from the "public" directory
app.use(express.static('public'));


// Add this to start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});