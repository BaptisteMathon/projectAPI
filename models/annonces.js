const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Nom ou chemin de l'image
});

module.exports = mongoose.model('Annonce', annonceSchema);
