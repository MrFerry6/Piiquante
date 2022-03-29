const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const User = require('../models/user');

exports.singup = (req, res, next) => {
  User.findOne({ email: req.body.email})
  .then((user) => {
    if(user){
      return res.status(401).json({
        error: new Error('User exist !!!!').message
      })
    }
  })  
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      const user = newUser(req, hash);
      saveUser(user, res);
    })
}

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
  .then((user) => {
    if (!user) {
      return res.status(401).json({
        error: new Error('User not found!').message
      })
    }
    logUser(req, user, res);
  })
  .catch(
    (error) => {
      res.status(401).json({
        error: error
      });
    }
  );
}

function logUser(req, user, res) {
  bcrypt.compare(req.body.password, user.password)
    .then((valid) => {
      if (!valid) {
        return res.status(401).json({
          error: new Error('Incorrect password!').message
        });
      }
      const token = createToken(user);
      setLog(res, user, token);
    }).catch(
      () => {
        res.status(401).json({
          error: new Error('Log not succes!!!').message
        });
      });
}

function setLog(res, user, token) {
  res.status(200).json({
    userId: user._id,
    token: token
  });
}

function createToken(user) {
  return jwt.sign(
    { userId: user._id },
    'RANDOM_TOKEN_SECRET',
    { expiresIn: '24h' });
}

function saveUser(user, res) {
  user.save()
    .then(() => {
      res.status(201).json({
        message: 'User added successfully!'
      });
    })
    .catch(() => {
      res.status(401).json({
        error: new Error("User not added!!!").message
      });
    });
}

function newUser(req, hash) {
  return new User({
    email: req.body.email,
    password: hash
  })
  }
