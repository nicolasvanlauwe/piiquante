const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

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