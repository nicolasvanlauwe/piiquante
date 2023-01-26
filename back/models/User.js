//mongoose pour faire des schema
const mongoose = require('mongoose');
//nous permet d'avoir une seule fois le meme mail donc un seul compte par personne
const uniqueValidator = require('mongoose-unique-validator');

//Schema de notre user
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

//On ne veut qu'un seul user par mail
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);