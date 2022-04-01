const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const sauceController = require('../controllers/sauce');
const userAuth = require('../middleware/userAuth');

router.get('/',auth, sauceController.getSauces);
router.get('/:id',auth, sauceController.getSauce);
router.post('/',auth ,multer , sauceController.newSauce);
router.delete('/:id', auth, userAuth, sauceController.deleteSauce);
router.put('/:id', auth, multer, userAuth, sauceController.modifySauce);
router.post('/:id/like', auth, sauceController.likesManager);

module.exports = router;