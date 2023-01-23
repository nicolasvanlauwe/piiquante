const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauces');
//Affiche une sauce
router.get('/:id', auth, sauceCtrl.getOneSauce);

//Affiche toutes les sauces
router.get('/', auth, multer, sauceCtrl.getAllSauces);

//Enregistre une sauce
router.post('/', auth, sauceCtrl.createSauce);

//Modifie une sauce
router.put('/:id', auth, sauceCtrl.modifySauce);

//Supprime une sauce
router.delete('/:id', auth, sauceCtrl.deleteSauce);

module.exports = router;