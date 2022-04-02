const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
require('dotenv').config();

mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASS+'@cluster0.affna.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log(process.env.DB_USER, process.env.DB_PASS)
    console.log('Unable to connect to MongoDB Atlas!');
    console.error(error);
  });
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/images', express.static(process.cwd() + '/images'));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);


module.exports = app;
