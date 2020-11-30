const Sauce = require('../models/Sauce');
const fs = require('fs');

//Returns the array of all the sauces in the database
exports.getSauce = (req,res,next)=>{
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(404).json({error}));
}

//Return the sauce with the provided ID
exports.getOnSauce = (req,res,next)=>{
    Sauce.findOne({_id : req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));
}

/**
 * Capture and save the image, analyze the sauce using a string and 
save it to the database, correctly setting its image URL. Resets loved and hated 
sauces to 0, and usersliked and usersdisliked sauces to empty arrays.
 */
exports.addSauce = (req,res,next)=>{
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` ,
      likes : 0,
      dislikes : 0,
      usersLiked : [],
      usersDisliked : []
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
}

/**
 * Updates the sauce with the provided ID. If an image is uploaded, capture it and update 
 * the Sauces URL image. If no file is provided, the sauce details appear directly in the body of the request
 *  (req.body.name, req.body.heat etc). If a file is provided, the sauce with string is in req.body.sauce. 
 * */
exports.modifySauce = (req,res,next)=>{
    const sauceObject = req.file? 
    { ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
    } :{ ...req.body };
    Sauce.updateOne({_id : req.params.id} , { ...sauceObject , _id:req.params.id })
    .then(() => res.status(200).json({ message : 'La sauce est modifié !'}))
    .catch(error => res.status(400).json({error}));

}

//Remove the sauce with the provided ID.
exports.deleteSauce = (req,res,next)=>{
    Sauce.findOne({_id : req.params.id})
    .then(sauce =>{ 
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`,()=>{
        Sauce.deleteOne({_id : req.params.id})
          .then(()=> res.status(200).json({ mmessage : 'La sauce est suprimé !'}))
          .catch(error => res.status(400).json({error}));
        });
    })
    .catch(error => res.status(500).json({error}));
}

//Set the "like" status for the supplied userID.
exports.likeSauce = (req,res,next)=>{
    const like = JSON.parse(req.body.like);
    Sauce.findOne({_id : req.params.id})
    .then(sauce=>{
        if (like == 1){
            if (!sauce.usersLiked.includes(req.body.userId)){
                sauce.usersLiked.push(req.body.userId);
            }
            res.status(200).json({message : 'L`utilisateur aime la sauce'});
        }
        else if (like == -1){
            if (!sauce.usersDisliked.includes(req.body.userId)){
                sauce.usersDisliked.push(req.body.userId);
            }
            res.status(200).json({message : 'L`utilisateur n`aime pas la sauce'});
        }
        else if (like == 0){
            if(sauce.usersLiked.includes(req.body.userId)){
                sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId),1);
            }
            else if(sauce.usersDisliked.includes(req.body.userId)){
                sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId),1);
            }
            res.status(200).json({message : 'L`utilisateur change son avis'});
        }
    })
    .catch(error => res.status(500).json({error}));
}