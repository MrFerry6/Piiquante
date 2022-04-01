const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const User = require('../models/user');

exports.singup = (req, res, next) => {

  if (!validateEmail(req.body.email)) {
    console.log('Error: not valid email !!!');
    return res.status(400).json({
      error: new Error('Bad Request').message
    })
  }
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      const user = newUser(req, hash);
      saveUser(user, res);
    })
    .catch(() => {
      console.log('Error: Hash not was created !!!');
      res.status(500).json({
        error: new Error('Internal Server Error').message
      })
    })
}

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      logUser(req, user, res);
    })
    .catch(() => {
      console.log('Error: User not found !!!')
      res.status(404).json({
        error: new Error('Not found').message
      });
    }
    );
}

function logUser(req, user, res) {
  bcrypt.compare(req.body.password, user.password)
    .then((valid) => {
      if (!valid) {        
        console.log('Error: Password not valid !!!')
        return res.status(401).json({
          error: new Error('Unauthorize').message
        })
      }
      const token = createToken(user);
      setLog(res, user, token);
    })
    .catch(
      () => {
        console.log('Error: User loggin not success !!!');
        res.status(500).json({
          error: new Error('Internal server error').message
        })
      })
}

function setLog(res, user, token) {
  console.log("Logging success !")
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
      console.log("User saved successfully !")
      res.status(201).json({
        message: 'Created'
      });
    })
    .catch(() => {
      console.log("Error: User not saved !!!")
      res.status(500).json({
        error: new Error("Internal Server Error").message
      });
    });
}

function newUser(req, hash) {
  return new User({
    email: req.body.email,
    password: hash
  })
}

function validateEmail(email) {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};