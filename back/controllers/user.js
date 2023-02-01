//bcrypt pour hasher le mdp 
const bcrypt = require('bcrypt');
//le schema d'un User
const User = require('../models/User')
//jwt pour créer le token
const jwt = require('jsonwebtoken');

//Fonction pour s'inscrire
exports.signup = (req, res, next) => {
    //On hash le mdp
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            let emailReg = new RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-z]{2,3})$/);
            let mdpReg = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
            if (!emailReg.test(req.body.email) || !mdpReg.test(req.body.password)) {
                return res.status(500).json({ message: 'E-mail ou mdp non conforme' })
            }
            //On créer le user
            const user = new User({
                email: req.body.email,
                password: hash
            });
            //On le save
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};

//Fonction pour se connecter
exports.login = (req, res, next) => {
    //On trouve le user 
    User.findOne({ email: req.body.email })
        .then(user => {
            //Si il est null, il n'a pas de compte
            if (user === null) {
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' })
            }
            //Sinon il a un compte 
            else {
                //On check son mdp
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        //Si le mdp est pas bonon signale
                        if (!valid) {
                            return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' })
                        }
                        //Sinon on renvoie un userID et un token signé 
                        else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    'RANDOM_TOKEN_SECRET',
                                    { expiresIn: '24h' })
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error }))
            }
        })
        .catch(error => res.status(500).json({ error }))
};