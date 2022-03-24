const Sauce = require('../models/sauce');
const fileSystem = require('fs');
const jwt = require('jsonwebtoken');
const { rawListeners } = require('process');

exports.getSauces = (req, res, next) => {
    Sauce.find().then(
      (sauces) => {
        res.status(200).json(sauces);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
};

exports.getSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id }).then(
      (sauce) => {
        res.status(200).json(sauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  };
  
exports.newSauce = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');    
    const bodysauce = JSON.parse(req.body.sauce);
    console.log(req.file.filename);
    const sauce = new Sauce({ 
        userId: bodysauce.userId,
        name: bodysauce.name,
        manufacturer: bodysauce.manufacturer,
        description: bodysauce.description,
        mainPeppper: bodysauce.mainPeppper,
        imageUrl: url + '/images/' + req.file.filename,
        heat: bodysauce.heat,
        likes:  0,
        dislikes:  0,
        usersLiked:  [],
        usersDisiked: []
    });
    sauce.save().then(() => {
      res.status(201).json({ message: 'Post saved successfully!' });
    }).catch(
      (error) => { res.status(400).json({ error: error });}
    );
  };

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
      .then( (sauce) => {

        
        
        const filename = sauce.imageUrl.split('/images/')[1];
        
        fileSystem.unlink('images/' + filename, () => {
        sauce.deleteOne({_id: req.params.id}).then(
            () => {
              res.status(200).json({
                message: 'Deleted!'
              });
            }
          ).catch(
            (error) => {
              res.status(400).json({
                error: error
              });
            }
          );
        });
      })};

exports.modifySauce = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  if(typeof req.file !== 'undefined'){
    console.log(req.file.filename);
    const bodysauce = JSON.parse(req.body.sauce);
    Sauce.updateOne( {_id: req.params.id},{
      userId: bodysauce.userId,
      name: bodysauce.name,
      manufacturer: bodysauce.manufacturer,
      description: bodysauce.description,
      mainPeppper: bodysauce.mainPeppper,
      imageUrl:  url + '/images/' + req.file.filename,
      heat: bodysauce.heat
    })
    .then(() => {
      res.status(201).json({ message: 'Sauce updated successfully!' })})
    .catch( (error) => {
      res.status(400).json({ error: error });
    });
  }
  if(typeof req.file === 'undefined'){
    Sauce.updateOne( {_id: req.params.id},{
      userId: req.body.userId,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      mainPeppper: req.body.mainPeppper,
      heat: req.body.heat
    })
    .then(() => {
      res.status(201).json({ message: 'Sauce updated successfully!' })})
    .catch( (error) => {
      res.status(400).json({ error: error });
    });
  }
};


exports.likesManager = (req, res, next) =>{
  Sauce.findOne({_id: req.params.id}).then((sauce) =>{
    
    if(req.body.like === 1){
      let sauceLikes = sauce.likes +1;
      let sauceUserid = req.body.userId;
      sauce.usersLiked.push(sauceUserid);
      Sauce.updateOne({_id: req.params.id},{
        likes: sauceLikes,
        usersLiked: sauce.usersLiked
      }).then(() => {
        res.status(201).json(
        { message: 'Like Added successfully !' })
      })
    }

    

    if(req.body.like === 0 && isUserLiked(sauce, req)){
      let sauceLikes = sauce.likes -1;

      removeUserLiked(sauce, req);

      Sauce.updateOne({_id: req.params.id},{
        likes: sauceLikes,
        usersLiked: sauce.usersLiked
      }).then(() => {
        res.status(201).json(
        { message: 'Like Removed successfully !' })
      })
    }

    if(req.body.like === 0 && isUserDisliked(sauce, req)){
      let sauceDislikes = sauce.dislikes -1;

      removeUserDisliked(sauce, req);

      Sauce.updateOne({_id: req.params.id},{
        dislikes: sauceDislikes,
        usersDisliked: sauce.usersDisliked
      }).then(() => {
        res.status(201).json(
        { message: 'Dislike Removed successfully !' })
      })
    }

    if(req.body.like === -1){
      let sauceDislikes = sauce.dislikes +1;
      let sauceUserid = req.body.userId;
      sauce.usersDisliked.push(sauceUserid);
      Sauce.updateOne({_id: req.params.id},{
        dislikes: sauceDislikes,
        usersDisliked: sauce.usersDisliked
      }).then(() => {
        res.status(201).json({ 
          message: 'dislike Added successfully !' })
        })
      }

  })
}



function removeUserLiked(sauce, req) {
  for (i = 0; sauce.usersLiked.length > i; i++) {
    if (sauce.usersLiked[i] === req.body.userId) {
      sauce.usersLiked.splice(i, 1);
    }
  };
}
function removeUserDisliked(sauce, req) {
  for (i = 0; sauce.usersDisliked.length > i; i++) {
    if (sauce.usersDisliked[i] === req.body.userId) {
      sauce.usersDisliked.splice(i, 1);
    }
  };
}

function isUserLiked(sauce, req) {
  for (i = 0; sauce.usersLiked.length > i; i++) {
    if (sauce.usersLiked[i] === req.body.userId) {
      return true;
    }
  };
  return false
}
function isUserDisliked(sauce, req) {
  for (i = 0; sauce.usersDisliked.length > i; i++) {
    if (sauce.usersDisliked[i] === req.body.userId) {
      return true;
    }
  };
  return false
}

/* exports.likesManager = (req, res, next) =>{ 
  Sauce.findOne({_id: req.params.id})
  .then( (sauce) => {
    if (!sauce) {
      res.status(404).json({
          error: new Error('Object Not found!')
      });
    };
  
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
  
    if (sauce.userId !== decodedToken.userId) {
      res.status(401).json({
        error: new Error('No autoritze request !')
      });
    };
    if(req.body.like === 1){
      for(i=0; sauce.usersLiked.length < 0; i++){
        if(sauce.userId === req.body.userId){
          console.log(i)
          res.status(401).json({
            error: new Error('Like previously added')
          })
        }
      }
      let sauceLikes = sauce.likes +1;
      let sauceUserid = req.body.userId;
      sauce.usersLiked.push(sauceUserid);
      Sauce.updateOne({_id: req.params.id},{
        likes: sauceLikes,
        usersLiked: sauce.usersLiked
      })
      .then(() => {res.status(201).json({ message: 'Like Added successfully !' })})
      .catch( (error) => {
        res.status(400).json({ error: error });
      });
    };
    if(req.body.like === 0){
      let sauceLikes = sauce.likes -1;
      Sauce.updateOne({_id: req.params.id},{
        likes: sauceLikes
      })
      .then(() => {res.status(201).json({ message: 'Like Removed successfully !' })})
      .catch( (error) => {
        res.status(400).json({ error: error });
      });
    };
    if(req.body.like === -1){
      Sauce.updateOne((req.params.id),{
        likes: sauce.likes + 1
      
      })
    };

  })
};*/

