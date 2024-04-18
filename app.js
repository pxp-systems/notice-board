// app.js
const multer = require('multer');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const config = require('./config.json');


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
    console.log(images);
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
  
    const maxWidth = 1080;
    const maxHeight = 720;

    // Resize the image with Sharp using more refined control
    sharp(req.file.buffer)
        .metadata()
        .then(metadata => {
            // Determine scaling factors to not exceed max dimensions while preserving aspect ratio
            const widthScale = maxWidth / metadata.width;
            const heightScale = maxHeight / metadata.height;
            const scale = Math.min(widthScale, heightScale);

            const newHeight = Math.min(Math.floor(metadata.height * scale), maxHeight);
            const newWidth = Math.min(Math.floor(metadata.width * scale), maxWidth);
            console.log(`Resizing image to ${newWidth}x${newHeight}`);
            
            return sharp(req.file.buffer)
                .resize(newWidth, newHeight, {
                    fit: sharp.fit.inside,
                    withoutEnlargement: false
                })
                .toBuffer();
        })
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
  const { selectedImages } = req.body;

  if (!selectedImages || selectedImages.length === 0) {
    return res.status(400).send({ message: 'No images specified for deletion' });
  }

  const directoryPath = path.join(__dirname, 'public/uploads');
  selectedImages.forEach(imageUrl => {
    const imageName = imageUrl.split('/').pop(); // Assuming imageUrl is like '/uploads/filename.jpg'
    fs.unlink(path.join(directoryPath, imageName), err => {
      if (err) {
        console.error(`Failed to delete ${imageName}`, err);
        return res.status(500).send({ message: `Failed to delete image ${imageName}` });
      }
    });
  });

  // Update the images array to exclude deleted images
  images = images.filter(image => !selectedImages.includes(image.url));

  res.status(200).send({ message: 'Images deleted successfully' });
});