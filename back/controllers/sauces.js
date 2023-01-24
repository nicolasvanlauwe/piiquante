const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
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

exports.likeSauce = (req, res, next) => {
    //je trouve la sauce
    //je verifie que la personne n'est dans aucun des tableau
    //si la personne n'est pas dans les tableau je verifie son like
    //si like = 1 alors je met son compteur de like a 1 et je l'ajoute au tableau de ceux qui ont like
    //si like = -1 alors je met son compteur de dislike a 1 et je l'ajoute au tableau de ceux qui ont dislike
    //si like = 0 alors je cherche dans quel tableau elle etait et je la supprime du tableau et je fais -1 a son like ou dislike
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // for (i in sauce.usersLiked) {
            //     if (i == req.auth.userId) {
            //         res.status(401).json({ message: 'Not authorized' });
            //     }
            // }
            // for (j in sauce.usersDisliked) {
            //     if (j == req.auth.userId) {
            //         res.status(401).json({ message: 'Not authorized' });
            //     }
            // }
            const likeOrNot = req.body.like;
            switch (likeOrNot) {
                case 1:
                    if (sauce.usersLiked.includes(req.auth.userId)) {
                        res.status(401).json({ message: 'Not authorized' });
                    }
                    sauce.likes += 1;
                    sauce.usersLiked.push(req.auth.userId);
                    break;
                case -1:
                    if (sauce.usersDisliked.includes(req.auth.userId)) {
                        res.status(401).json({ message: 'Not authorized' });
                    }
                    sauce.dislikes += 1;
                    sauce.usersDisliked.push(req.auth.userId);
                    break;
                case 0:
                    if (sauce.usersLiked.includes(req.auth.userId)) {
                        sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.auth.userId), 1);
                        sauce.likes += -1;
                    } else {
                        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.auth.userId), 1);
                        sauce.dislikes += -1
                    }

            }
            Sauce.updateOne(sauce)
                .then(() => { res.status(200).json({ message: 'Sauce likée ou non !' }) })
                .catch(error => { res.status(500).json({ error }); })
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};