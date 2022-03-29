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
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch(() => {
      res.status(404).json({
        error: new Error('Sauce Not Found !!!')
      });
    }
    );
}
exports.newSauce = (req, res, next) => {
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
  });
  sauce.save().then(() => {
    res.status(201).json({
      message: 'Post saved successfully!'
    });
  })
    .catch((error) => {
      res.status(400).json({
        error: error
      })
    }
    );
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      deleteSauce(sauce, req, res);
    })
    .catch(() => {
      res.status(400).json({
        error: new Error('Sauce not found !!!')
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
        return res.status(400).json({
          error: new Error('Invalid Parameters !!!!')
        })
      }

      isAddLike(req, sauce, res);

      isRemoveLike(req, sauce, res);

      isAddDislike(req, sauce, res);

      isRemoveDislike(req, sauce, res);
    })
    .catch(() => {
      res.status(400).json({
        error: new Error()
      })
    })
}

function isValidLike(like){
  if (like != 1 || like != 0 || like != -1){
    return false;
  }
  else{
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
      res.status(200).json({
        message: 'dislike Added successfully !'
      });
    })
    .catch(
      () => {
        res.status(400).json({
          error: new Error('Disike not added !!!')
        });
      });
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
      res.status(200).json({
        message: 'Dislike Removed successfully !'
      });
    })
    .catch(
      () => {
        res.status(400).json({
          error: new Error('Disike not removed !!!')
        });
      });
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
      res.status(204).json({
        message: 'Like Removed successfully !'
      });
    })
    .catch(
      () => {
        res.status(400).json({
          error: new Error('Like not removed !!!')
        });
      });
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
      res.status(200).json({
        message: 'Like Added successfully !'
      });
    })
    .catch(
      () => {
        res.status(400).json({
          error: new Error('Like not removed !!!')
        });
      });
}

function deleteSauce(sauce, req, res) {
  const filename = sauce.imageUrl.split('/images/')[1];

  fileSystem.unlink('images/' + filename, () => {
    sauce.deleteOne({ _id: req.params.id })

      .then(() => {
        res.status(200).json({
          message: 'Post Deleted !'
        });
      })
      .catch(() => {
        res.status(400).json({
          error: new Error('Post not Deleted !!!')
        });
      });
  });
}

function isNotAnImage(req, res) {
  if (typeof req.file === 'undefined') {
    Sauce.updateOne({ _id: req.params.id }, {
      userId: req.body.userId,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      mainPeppper: req.body.mainPeppper,
      heat: req.body.heat
    })
      .then(() => {
        res.status(201).json(
          { message: 'Sauce updated successfully!' });
      })
      .catch((error) => {
        res.status(400).json(
          { error: new Error('Post not Found !!!') });
      });
  }
}

function isAnImage(req, res) {

  const url = req.protocol + '://' + req.get('host');

  if (typeof req.file !== 'undefined') {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fileSystem.unlink('images/' + filename, () => {
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
              res.status(201).json(
                { message: 'Sauce updated successfully!' });
            })
            .catch(() => {
              res.status(400).json(
                { error: new Error('Suce not found !!!') });
            });
        });
      })
      .catch(() => {
        res.status(400).json(
          { error: new Error('Post not Found !!!') });
      });
  }
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

