const Sauce = require('../models/sauce');
const fileSystem = require('fs');


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
  
exports.newSauceee = ((req, res, next) => {
    const url = req.protocol + '://' + req.get('host');    
      const bodysauce = JSON.parse(req.body.sauce);
      console.log(bodysauce)

    const sauce = new Sauce({ 
        userId: bodysauce.userId,
        name: bodysauce.name,
        manufacturer: bodysauce.manufacturer,
        description: bodysauce.description,
        mainPeppper: bodysauce.mainPeppper,
        imageUrl: 'imageUrl',
        heat: 1,
        likes:  0,
        dislikes:  0,
        usersLiked:  ['user1', 'user3'],
        usersDisiked: ['user1', 'user3']
    });
    console.log(sauce);
    sauce.save().then(
      () => {
        res.status(201).json({
          message: 'Post saved successfully!'
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

exports.deleteSauce = (req, res, next) => {
    Thing.findOne({_id: req.params.id}).then( (sauce) => {
        if (!sauce) {
            return res.status(404).json({
                error: new Error('Object Not found!')
            });
        }
        if (thing.userId !== req.auth.userId) {
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