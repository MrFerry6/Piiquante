const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const sauceController = require('../controllers/sauce');

router.get('/',auth, sauceController.getSauces);
router.get('/:id',auth, sauceController.getSauce);
router.post('/',auth ,multer , sauceController.newSauce);
router.delete('/:id', auth, sauceController.deleteSauce);
router.put('/:id', auth, multer, sauceController.modifySauce);

module.exports = router;