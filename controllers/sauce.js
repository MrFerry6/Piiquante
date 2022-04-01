const Sauce = require('../models/sauce');
const fileSystem = require('fs');

exports.getSauces = (req, res, next) => {
  Sauce.find()
    .then(
      (sauces) => {
        console.log('Sauces found !')
        res.status(200).json(sauces);
      }
    )
    .catch(() => {
      console.log('Error: Sauces not found');
      res.status(404).json({
        error: new Error('Not found').message
      });
    }
    );
}
exports.getSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      console.log('Sauce found !')
      res.status(200).json(sauce);
    })
    .catch(() => {
      console.log('Error: Sauce not found !!!')
      res.status(404).json({
        error: new Error('Not found').message
      });
    }
    );
}
exports.newSauce = (req, res, next) => {

  const sauce = newSauce(req, res);
  saveSauce(sauce, res);
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      deleteSauce(sauce, req, res);
    })
    .catch(() => {
      console.log('Error: Sauce not found !!!');
      res.status(404).json({
        error: new Error('Not found !!!').message
      })
    })
}

exports.modifySauce = (req, res, next) => {

  isAnImage(req, res);

  isNotAnImage(req, res);

};


exports.likesManager = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const like = req.body.like;
      const user = req.body.userId;
      if (isValidLike(like) && user == null) {
        console.log('Error: Invalid parameters !!!')
        return res.status(400).json({
          error: new Error('Bad request')
        })
      }

      isAddLike(req, sauce, res);

      isRemoveLike(req, sauce, res);

      isAddDislike(req, sauce, res);

      isRemoveDislike(req, sauce, res);
    })
    .catch(() => {
      console.log('Error: Sauce not found !!!');
      res.status(404).json({
        error: new Error('Not found !!!')
      })
    })
}

function saveSauce(sauce, res) {
  sauce.save().then(() => {
    console.log('Sauce saved !')
    res.status(201).json({
      message: 'Created'
    });
  })
    .catch(() => {
      console.log('Error: Sauce not saved !!!')
      res.status(500).json({
        error: new Error('Internal server error')
      });
    })
}

function newSauce(req, res) {

  const url = req.protocol + '://' + req.get('host');

  const bodysauce = JSON.parse(req.body.sauce);

  const sauce = new Sauce({
    userId: bodysauce.userId,
    name: bodysauce.name,
    manufacturer: bodysauce.manufacturer,
    description: bodysauce.description,
    mainPeppper: bodysauce.mainPeppper,
    imageUrl: url + '/images/' + req.file.filename,
    heat: bodysauce.heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisiked: []
  })

  return sauce;
}


function isValidLike(like) {
  if (like != 1 || like != 0 || like != -1) {
    return false;
  }
  else {
    return true;
  }
}

function isAddDislike(req, sauce, res) {
  if (req.body.like === -1) {
    addDislike(sauce, req, res);
  }
}

function addDislike(sauce, req, res) {
  let sauceDislikes = sauce.dislikes + 1;
  let sauceUserid = req.body.userId;
  sauce.usersDisliked.push(sauceUserid);
  Sauce.updateOne({ _id: req.params.id }, {
    dislikes: sauceDislikes,
    usersDisliked: sauce.usersDisliked
  })
    .then(() => {
      console.log('Dislike Added successfully !');
      res.status(204).json({
        message: 'No content'
      });
    })
    .catch(() => {
      console.log('Error: Dislike not added !!!')
      res.status(500).json({
        error: new Error('Internal server error')
      });
    })
}


function isRemoveDislike(req, sauce, res) {
  if (req.body.like === 0 && isUserDisliked(sauce, req)) {

    removeUserDisliked(sauce, req);

    removeDislike(req, sauce, res);

  }
}

function removeDislike(req, sauce, res) {
  let sauceDislikes = sauce.dislikes - 1;

  Sauce.updateOne({ _id: req.params.id }, {
    dislikes: sauceDislikes,
    usersDisliked: sauce.usersDisliked
  })
    .then(() => {
      console.log('Dislike Removed successfully !');
      res.status(204).json({
        message: 'No content'
      });
    })
    .catch(() => {
      console.log('Error: Disike not removed !!!')
      res.status(500).json({
        error: new Error('Internal server error')
      });
    })
}

function isRemoveLike(req, sauce, res) {
  if (req.body.like === 0 && isUserLiked(sauce, req)) {

    removeUserLiked(sauce, req);

    removeLike(req, sauce, res);
  }
}

function removeLike(req, sauce, res) {
  let sauceLikes = sauce.likes - 1;

  Sauce.updateOne({ _id: req.params.id }, {
    likes: sauceLikes,
    usersLiked: sauce.usersLiked
  })
    .then(() => {
      console.log('Like Removed successfully !');
      res.status(204).json({
        message: 'No content'
      });
    })
    .catch(() => {
      console.log('Error: Like not removed !!!')
      res.status(500).json({
        error: new Error('Internal server error').message
      });
    })
}

function isAddLike(req, sauce, res) {
  if (req.body.like === 1) {
    addLike(sauce, req, res);
  }
}

function addLike(sauce, req, res) {
  let sauceLikes = sauce.likes + 1;
  let sauceUserid = req.body.userId;
  sauce.usersLiked.push(sauceUserid);
  Sauce.updateOne({ _id: req.params.id }, {
    likes: sauceLikes,
    usersLiked: sauce.usersLiked
  })
    .then(() => {
      console.log('Like added successfully !');
      res.status(204).json({
        message: 'No content'
      });
    })
    .catch(() => {
      console.log('Error: Like not added !!!')
      res.status(500).json({
        error: new Error('Internal server error').message
      });
    })
}
function deleteSauce(sauce, req, res) {
  const filename = sauce.imageUrl.split('/images/')[1];

  fileSystem.unlink('images/' + filename, () => {
    sauce.deleteOne({ _id: req.params.id })

      .then(() => {
        console.log('Post Deleted suscesfully !');
        res.status(200).json({
          message: 'Ok!'
        });
      })
      .catch(() => {
        console.log('Error: Image not deleted !!!')
        res.status(500).json({
          error: new Error('Internal server error').message
        })
      })
  })
}


function isNotAnImage(req, res) {
  if (typeof req.file === 'undefined') {
    updateSauce(req, res);
  }
}

function isAnImage(req, res) {

  if (typeof req.file !== 'undefined') {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fileSystem.unlink('images/' + filename, () => {
          updateSauceImage(req, res);
        });
      })
      .catch(() => {
        console.log('Error: Image not deleted !!!')
        res.status(500).json({
          error: new Error('Internal server error').message
        })
      })
  }
}

function updateSauce(req, res) {
  Sauce.updateOne({ _id: req.params.id }, {
    userId: req.body.userId,
    name: req.body.name,
    manufacturer: req.body.manufacturer,
    description: req.body.description,
    mainPeppper: req.body.mainPeppper,
    heat: req.body.heat
  })
    .then(() => {
      console.log('Sauce updated successfully!');
      res.status(200).json(
        { message: 'Ok' })
    })
    .catch(() => {
      console.log('Error: Post not found !!!')
      res.status(404).json({
        error: new Error('Not found').message
      })
    })
}

function updateSauceImage(req, res) {
  const url = req.protocol + '://' + req.get('host');
  const bodysauce = JSON.parse(req.body.sauce);

  Sauce.updateOne({ _id: req.params.id }, {
    userId: bodysauce.userId,
    name: bodysauce.name,
    manufacturer: bodysauce.manufacturer,
    description: bodysauce.description,
    mainPeppper: bodysauce.mainPeppper,
    imageUrl: url + '/images/' + req.file.filename,
    heat: bodysauce.heat
  })
    .then(() => {
      console.log('Sauce updated successfully!');
      res.status(200).json(
        { message: 'Ok' })
    })
    .catch(() => {
      console.log('Error: Post not found !!!')
      res.status(404).json({
        error: new Error('Not found').message
      })
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

