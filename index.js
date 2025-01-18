// index.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
dotenv.config();
const Annonce = require('./models/annonces');
const Image = require('./models/images')
const rateLimitMiddleware = require('./midllewares/rateLimiter');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/front', express.static(path.join(__dirname, 'front')));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Ajouter un timestamp pour éviter les conflits
  },
});
const upload = multer({ storage });

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((err) => console.log('Connexion à MongoDB échouée : ', err));


// ********************************************
// GET :

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/front/menu.html');
})

app.get('/editAnnonce/:id', (req, res) => {
  res.sendFile(__dirname + '/front/editAnnonce.html');
})

app.get('/allAnnonces', async (req, res) => {
  try{
    const allAnnonces = await Annonce.find();
    if (!allAnnonces){
      return res.status(404).send("Aucune annonce trouvée");
    }
    res.status(200).json(allAnnonces);
  } catch(err){
    res.status(500).send("Erreur lors de la récupération des annonces : " + err);
  }
})

app.get('/getAnnonce/:id', async (req, res) => {
  try{
    const annonce = await Annonce.findById(req.params.id)
    if (!annonce){
      return res.status(404).send("Annonce non trouvée");
    }
    res.status(200).json(annonce);
  } catch(err){
    res.status(500).send("Erreur lors de la récupération de l'annonce : " + err);
  }
})


// ********************************************
// POST :

app.post('/createAnnonce', upload.single('image'), async (req, res) => {
  try {
      const newAnnonce = new Annonce({
          title: req.body.title,
          description: req.body.description,
          image: req.file.filename, 
      });
      const savedAnnonce = await newAnnonce.save();
      res.status(201).json(savedAnnonce);
  } catch (err) {
      console.error(err);
      res.status(500).send("Erreur lors de la création de l'annonce : " + err);
  }
});


// ********************************************
// PUT :

app.put('/updateAnnonce/:id', async (req, res) => {
  try{
    const updateAnnonce = await Annonce.findById(req.params.id);
    if (!updateAnnonce){
      return res.status(404).send("Annonce non trouvée")
    }
    updateAnnonce.title = req.body.title || updateAnnonce.title;
    updateAnnonce.description = req.body.description || updateAnnonce.description;
    updateAnnonce.image = req.body.image || updateAnnonce.image;
    const updatedAnnonce = await updateAnnonce.save();
    res.status(200).json(updatedAnnonce);
  } catch(err){
    res.status(500).send("Erreur lors de la mise à jour de l'annonce : " + err)
  }
})

// ********************************************
// DELETE :

app.delete('/deleteAnnonce/:id', async (req, res) => {
  try{
    const deleteAnnonce = await Annonce.findByIdAndDelete(req.params.id);
    if (!deleteAnnonce){
      return res.status(404).send("Annonce non trouvée");
    }
    res.status(200).json({success: true, message: "Annonce supprimée avec succès"});
  } catch(err){
    res.status(500).send("Erreur lors de la suppression de l'annonce : " + err);
  }
})

app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT, () => {
  console.log(`Serveur en écoute sur le port http://localhost:${process.env.PORT}`);
});