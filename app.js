const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const helmet = require('helmet');  //to avoid cookie xss attacks for the HttpOnly flag
const xss = require('xss-clean');
const userRouters = require('./routes/user');
const sauceRouters = require('./routes/sauce');
const User = require('./models/User');
const Sauce = require('./models/Sauce');
const path = require('path');



const app = express();

mongoose.connect(process.env.CONNECT_TO_DATABASE,{ 
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(() => {
    console.log('Connexion à MongoDB réussie !')
    User.find()
    .then(users => console.table(users.map(user=>user.email)))
    .catch(error => console.log('no users'));
  } 
)
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());
app.use(xss());
app.use(helmet());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth' , userRouters); 
app.use('/api/sauces' , sauceRouters); 

module.exports = app;