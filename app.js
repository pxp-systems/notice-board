// app.js
const multer = require('multer');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const config = require('./config.json');
require('dotenv').config();

app.set('view engine', 'ejs');
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.get('/', (req, res) => {
  const dir = path.join(__dirname, 'public/uploads');
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred');
      return;
    }
    const images = files.filter(file => !/(^|\/)\.[^\/\.]/g.test(file)); // Ignore hidden files
    //console.log(images);
    res.render('index', { images });
  });
});

app.get('/upload', (req, res) => {
  res.render('upload', { title: 'Upload Image' });
});

app.listen(3000, () => console.log('Server started on port 3000'));



// Configure Multer Storage to resize the image
const storage = multer.memoryStorage();
const upload = multer({ storage });
// Middleware to resize the image
const sharp = require('sharp');  // Make sure to require sharp at the top of your file

function resizeImage(req, res, next) {
  if (!req.file) {
    next();
    return;  // Return to stop further execution if no file is uploaded
  }

  const targetWidth = 1024;
  const targetHeight = 768;

  // Resize the image with Sharp to fit within the target dimensions while preserving the aspect ratio
  sharp(req.file.buffer)
    .resize(targetWidth, targetHeight, {
      fit: sharp.fit.inside,  // Resize the image to fit inside the provided dimensions without cropping

    })
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


// Upload middleware handling the file and processing image
app.post('/upload', upload.single('image'), resizeImage, (req, res) => {
  // Ensure a file was uploaded
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Check if the password is correct
  const { password } = req.body;
  if (password !== process.env.PASSWORD) {
    return res.status(401).send('Incorrect password.');
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



// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to list images
let images = []; // image global variable
app.get('/images', (req, res) => {
  const directoryPath = path.join(__dirname, 'public/uploads');

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send({ message: "Unable to scan files!" });
    }
    let fileInfos = [];
    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: `/uploads/${file}`
      });
    });
    images = files.map(file => ({
      name: file,
      url: `/uploads/${file}`
    }));
    //console.log("called", fileInfos)
    res.status(200).send(fileInfos);
  });
});

app.use(express.json());
// Route to delete images
app.post('/delete-images', (req, res) => {
  const { selectedImages, password } = req.body;

  // Logging the password (be cautious about logging sensitive information in production)
  console.log(password, process.env.PASSWORD);

  // Check if the password is correct
  if (password === process.env.PASSWORD) { // Use '===' for strict comparison and make sure environment variable is correctly referenced
    if (!selectedImages || selectedImages.length === 0) {
      return res.status(400).send({ message: 'No images specified for deletion' });
    }

    const directoryPath = path.join(__dirname, 'public/uploads');
    selectedImages.forEach((imageUrl, index) => {
      const imageName = imageUrl.split('/').pop(); // Assuming imageUrl is like '/uploads/filename.jpg'
      fs.unlink(path.join(directoryPath, imageName), err => {
        if (err) {
          console.error(`Failed to delete ${imageName}`, err);
          return res.status(500).send({ message: `Failed to delete image ${imageName}` });
        }

        // Check if it's the last image in the loop to send a response
        if (index === selectedImages.length - 1) {
          images = images.filter(image => !selectedImages.includes(image.url)); // Update the images array
          res.status(200).send({ message: 'Images deleted successfully' });
        }
      });
    });
  } else {
    res.status(401).send("Unauthorized: Incorrect Password");
  }
});
