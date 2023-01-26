//Require du schema de nos sauces
const Sauce = require('../models/Sauce');
//Require du file system pour nous permettre de delete les images
const fs = require('fs');

//Fonction pour l'affichage d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

//Fonction pour l'affichage de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
};

//Fonction pour créer une sauce
exports.createSauce = (req, res, next) => {
    //On recupere l'objet sauce que notre form nous retourne
    const sauceObject = JSON.parse(req.body.sauce);
    //On supprime l'id et l'userId pour mettre ceux qu'on veut
    delete sauceObject._id;
    delete sauceObject._userId;
    //Création de notre sauce grâce à notre schéma
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    //On sauvegarde la sauce dans notre BDD
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

//Fonction pour modifier une sauce
exports.modifySauce = (req, res, next) => {
    //Verification si on a changé d'image et applique le nv chemin si c'est le cas
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    //On cherche la bonne sauce
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            //On regarde si c'est bien l'utilisateur qui l'a créé
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                //On update la sauce si tout est bon
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Fonction pour la suppression de la sauce
exports.deleteSauce = (req, res, next) => {
    //On cherche la bonne sauce
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            //On regarde si c'est la personne qui l'a créé
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                //On supprime l'image dans notre dossier images et on supprime dans notre BDD
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

//Fonction pour liker la sauce
exports.likeSauce = (req, res, next) => {
    //On trouve la bonne sauce
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const likeOrNot = req.body.like;
            //On va switcher sur les differents cas du like
            switch (likeOrNot) {
                //Cas du like
                case 1:
                    //On regarde si l'utilisateur l'a deja like
                    if (sauce.usersLiked.includes(req.auth.userId)) {
                        res.status(401).json({ message: 'Not authorized' });
                    }
                    //Sinon like +1 et on ajoute le userId au tableau
                    else {
                        sauce.likes += 1;
                        sauce.usersLiked.push(req.auth.userId);
                    }
                    break;
                //Cas du dislike
                case -1:
                    //On regarde si l'utilisateur l'a deja dislike
                    if (sauce.usersDisliked.includes(req.auth.userId)) {
                        res.status(401).json({ message: 'Not authorized' });
                    }
                    //Sinon dislike +1 et on ajoute le userId au tableau
                    else {
                        sauce.dislikes += 1;
                        sauce.usersDisliked.push(req.auth.userId);
                    }
                    break;
                //Cas ou on enleve son dislike ou son like
                case 0:
                    //Si la personne est dans le tableau des likes alors on travaille sur ça
                    if (sauce.usersLiked.includes(req.auth.userId)) {
                        sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.auth.userId), 1);
                        sauce.likes += -1;
                    }
                    //Sinon on travaille sur les dislikes 
                    else {
                        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.auth.userId), 1);
                        sauce.dislikes += -1
                    }
                    break;
            }
            //On update dans la BDD pour finir
            Sauce.updateOne({ _id: req.params.id }, sauce)
                .then(() => { res.status(200).json({ message: 'Sauce likée ou non !' }) })
                .catch(error => { res.status(500).json({ error }); })
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};