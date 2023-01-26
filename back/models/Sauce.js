//mongoose pour faire des schema
const mongoose = require('mongoose');

//Création du schema de nos sauces
const schemaSauce = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, required: true, default: 0 },
    dislikes: { type: Number, required: true, default: 0 },
    usersLiked: { type: Array, required: true, default: [] },
    usersDisliked: { type: Array, required: true, default: [] }
});

module.exports = mongoose.model('Sauce', schemaSauce);