const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Encrypts the user's password, adds the user to the database
exports.signupUser = (req,res,next)=>{
    bcrypt.hash(req.body.password , 10)
        .then(hash =>{
            const user = new User({
                email : req.body.email,
                password : hash
            });
            user.save()
                .then(() => res.status(200).json({message : 'Utilisateur crée ! '}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

/**
 * Checks the user's credentials, returning the userID from the 
database and a signed JSON web token (also containing the userID)
 */
exports.loginUser =(req,res,next)=>{
    User.findOne({email : req.body.email})
        .then(user => {
            if(!user){
                return res.status(401).json({error : 'utilisateur non trouvé !'});
            }
            bcrypt.compare(req.body.password , user.password)
               .then(valide => {
                   if(!valide){
                       return res.status(401).json({error : 'mot de passe incorrect !'});
                    }
                    res.status(200).json({
                        userId : user._id,
                        token : jwt.sign(
                            {userId : user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn : '24h'})
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};