const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; 
const passwordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
var tryingTime = 3; //for the security we can just try the password three times 

//Encrypts the user's password, adds the user to the database
exports.signupUser = (req,res,next)=>{
    //validate the email address
    if(mailFormat.test(req.body.email)){
        if (req.body.password.match(passwordFormat)){
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
        }
        else{
            return res.status(403).json({error : 'mot de passe de 8 à 15 caractères contenant au moins une lettre minuscule, une lettre majuscule, un chiffre numérique et un caractère spécial'});
        }
    }
    else{
        return res.status(403).json({error : 'adresse mail non valide!'});
    }
};

/**
 * Checks the user's credentials, returning the userID from the 
database and a signed JSON web token (also containing the userID)
 */
exports.loginUser =(req,res,next)=>{
    if(mailFormat.test(req.body.email)){
        if (req.body.password.match(passwordFormat) && tryingTime > 0){
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
        }
        else {
            if (tryingTime > 0){
                tryingTime--;
                console.log("you have : "+tryingTime+" try");
                return res.status(403).json({error : 'mot de passe de 8 à 15 caractères contenant au moins une lettre minuscule, une lettre majuscule, un chiffre numérique et un caractère spécial!'});
            }
            else{
                return res.status(403).json({error : 'mot de passe non valide!'});
            }
        }
    }
    else{
        return res.status(403).json({error : 'adresse mail non valide!'});
    }
};