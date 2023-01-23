//Require
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user')
const sauceRoutes = require('./routes/sauces')
const path = require('path');


//Connexion BDD
mongoose.set('strictQuery', true);
mongoose.connect(`mongodb+srv://root:root@cluster0.hrlrdfh.mongodb.net/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


//Fix le pb de CORS
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;