//express qui va nous permettre de faire les routes
const express = require('express');
//router qui va nous servir pour les routes
const router = express.Router();
//auth pour le renvoi du token 
const auth = require('../middleware/auth');
//multer pour gérer les images
const multer = require('../middleware/multer-config');
//controller des sauces pour appeler les fonctions
const sauceCtrl = require('../controllers/sauces');

//Affiche une sauce
router.get('/:id', auth, sauceCtrl.getOneSauce);

//Affiche toutes les sauces
router.get('/', auth, sauceCtrl.getAllSauces);

//Enregistre une sauce
router.post('/', auth, multer, sauceCtrl.createSauce);

//Modifie une sauce
router.put('/:id', auth, multer, sauceCtrl.modifySauce);

//Supprime une sauce
router.delete('/:id', auth, sauceCtrl.deleteSauce);

//Like de la sauce
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;