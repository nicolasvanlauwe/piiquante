//express qui va nous permettre de faire les routes
const express = require('express');
//router qui va nous servir pour les routes
const router = express.Router();
//controller des users pour appeler les fonctions
const userCtrl = require('../controllers/user');

//s'inscrire
router.post('/signup', userCtrl.signup);
//se connecter
router.post('/login', userCtrl.login);

module.exports = router;