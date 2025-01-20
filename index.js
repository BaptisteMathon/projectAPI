// index.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const etag = require('etag')
dotenv.config();
const Annonce = require('./models/annonces');
const User = require('./models/user')
const rateLimitMiddleware = require('./middlewares/rateLimiter');
const authcontroller = require('./controllers/authcontroller');
const authJwt = require('./middlewares/authJwt');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/front', express.static(path.join(__dirname, 'front')));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
  },
});
const upload = multer({ storage });

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((err) => console.log('Connexion à MongoDB échouée : ', err));



// ********************************************

  // app.get('/api/todos',[authJwt.verifyToken,authJwt.isExist],async (req,res)=>{
  //   try{
  //      const todos = await Todo.find();
  //      const todoJson = JSON.stringify(todos);
  //      res.json(todos);
  //    }catch (err) {
  //      res.status(500).send('Erreur lors de la récupération des tâches');
  //    }   
  //  })
  //  app.post('/api/todos', [authJwt.verifyToken,authJwt.isExist],async (req, res) => {
  //    if (!req.user.isAdmin) {
  //      return res.status(403).send({ message: "Seulement pour Admin" });
  //    }
  //      try {
  //        const newTodo = new Todo({
  //          title: req.body.title,
  //          completed: req.body.completed || false
  //        });
     
  //        const savedTodo = await newTodo.save();
  //        res.status(201).json(savedTodo);
  //      } catch (err) {
  //        res.status(500).send('Erreur lors de la création de la tâche');
  //      }
  //  });
  //  app.get('/api/todos/:id', [authJwt.verifyToken,authJwt.isExist],async (req, res) => {
  //      try {
  //          const todo = await Todo.findById(req.params.id);
  //          if (!todo) {
  //            return res.status(404).send('Tâche non trouvée');
  //          }
  //          const todoJson = JSON.stringify(todo);
  //          const hash = etag(todoJson);
  //          if (req.headers['if-none-match'] === hash) {
  //            return res.status(304).send(); // Pas de modifications, renvoyer 304 Not Modified
  //          }
  //          res.setHeader('ETag', hash);
  //          res.status(200).json(todo);
  //      }catch (err) {
  //          res.status(500).send('Erreur lors de la création de la tâche');
  //      }
       
  //  });
  //  app.put('/api/todos/:id',[authJwt.verifyToken,authJwt.isExist], async (req, res) => {
  //    if (!req.user.isAdmin) {
  //      return res.status(403).send({ message: "Seulement pour Admin" });
  //    }
  //      const todo = await Todo.findById(req.params.id);
  //      if (!todo) {
  //          return res.status(404).send('Tâche non trouvée');
  //      }
  //      const clientETag = req.headers['if-match'];
  //      const currentETag = etag(JSON.stringify(todo));
  //      console.log(clientETag);
  //      console.log(currentETag);
  //      if (clientETag !== currentETag) {
  //          return res.status(412).send('Precondition Failed: ETag mismatch'); // 412 Precondition Failed
  //      }
  //      todo.title = req.body.title || todo.title;  
  //      todo.completed = req.body.completed || todo.completed;
  //      const updatedTodo = await todo.save();
  //      res.status(200).json(updatedTodo);
  //  });

// ********************************************
// GET :

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/front/menu.html');
})

app.get('/editAnnonce/:id', (req, res) => {
  res.sendFile(__dirname + '/front/editAnnonce.html');
})

app.get('/allAnnonces', [authJwt.verifyToken,authJwt.isExist], async (req, res) => {
  try{
    const allAnnonces = await Annonce.find();
    if (!allAnnonces){
      return res.status(404).send("Aucune annonce trouvée");
    }
    const allAnoncesJson = JSON.stringify(allAnnonces);
    const hash = etag(allAnoncesJson);
    if(req.headers['if-none-match'] === hash){
      return res.status(304).send()
    }
    res.setHeader('Etag', hash)
    res.status(200).json(allAnnonces);
  } catch(err){
    res.status(500).send("Erreur lors de la récupération des annonces : " + err);
  }
})

app.get('/getAnnonce/:id', [authJwt.verifyToken,authJwt.isExist], async (req, res) => {
  try{
    const annonce = await Annonce.findById(req.params.id)
    if (!annonce){
      return res.status(404).send("Annonce non trouvée");
    }
    const annonceJson = JSON.stringify(annonce)
    const hash = etag(annonceJson)
    if(req.headers['if-none-match'] === hash){
      return res.status(304).send()
    }
    res.setHeader('Etag', hash)
    res.status(200).json(annonce);
  } catch(err){
    res.status(500).send("Erreur lors de la récupération de l'annonce : " + err);
  }
})


// ********************************************
// POST :

// app.post('/createAnnonce', upload.single('image'), [authJwt.verifyToken,authJwt.isExist, rateLimitMiddleware], async (req, res) => {
//   try {
//       const newAnnonce = new Annonce({
//           title: req.body.title,
//           description: req.body.description,
//           image: req.file.filename, 
//       });
//       const savedAnnonce = await newAnnonce.save();
//       res.status(201).json(savedAnnonce);
//   } catch (err) {
//       console.error(err);
//       res.status(500).send("Erreur lors de la création de l'annonce : " + err);
//   }
// });

app.post('/createAnnonce', [authJwt.verifyToken,authJwt.isExist, rateLimitMiddleware], async (req, res) => {
    try {
        const newAnnonce = new Annonce({
            title: req.body.title,
            description: req.body.description,
            image: req.body.image, 
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

app.put('/updateAnnonce/:id',[authJwt.verifyToken,authJwt.isExist],  async (req, res) => {
  try{
    const updateAnnonce = await Annonce.findById(req.params.id);
    if (!updateAnnonce){
      return res.status(404).send("Annonce non trouvée")
    }
    const clientEtag = req.headers['if-match']
    const currentEtag = etag(JSON.stringify(updateAnnonce))
    console.log(clientEtag)
    console.log(currentEtag)
    if(clientEtag !== currentEtag){
      return res.status(412).send('Precondition Failed: Etag mismatch')
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

app.delete('/deleteAnnonce/:id', [authJwt.verifyToken,authJwt.isExist], async (req, res) => {
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

app.post("/api/auth/signup", authcontroller.signup);
app.post("/api/auth/signin",authcontroller.signin);
app.post("/api/auth/signout",authcontroller.signout);

app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT, () => {
  console.log(`Serveur en écoute sur le port http://localhost:${process.env.PORT}`);
});

