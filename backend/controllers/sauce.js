const Sauce = require('../models/sauce');
const fileSystem = require('fs');
const jwt = require('jsonwebtoken')

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
    Sauce.findOne({
      _id: req.params.id
    }).then(
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
    console.log(req.body);
    console.log(res.file);
    sauce.save().then(() => {
      res.status(201).json({ message: 'Post saved successfully!' });
    }).catch(
      (error) => { res.status(400).json({ error: error });}
    );
  };

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then( (sauce) => {
        if (!sauce) {
            return res.status(404).json({
                error: new Error('Object Not found!')
            });
        }
        
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        
      if (sauce.userId !== decodedToken.userId) {
        return res.status(401).json({
          error: new Error('No autoritze request !')
        });
      }
        //const filename = thing.imageUrl.split('/images/')[1];
        //fs.unlink('images/' + filename, () => {
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
      }
    //);
 //};

exports.modifySauce = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
Sauce.updateOne( (req.params.id, {
  userId: req.body.userId,
  name: req.body.name,
  manufacturer: req.body.manufacturer,
  description: req.body.description,
  mainPeppper: req.body.mainPeppper,
  imageUrl: url + '/api/images/' + req.body.url,
  heat: req.body.heat,
}))
  .then(() => {res.status(201).json({ message: 'Thing updated successfully!' })})
  .catch( (error) => {
    res.status(400).json({ error: error });
  });
};
