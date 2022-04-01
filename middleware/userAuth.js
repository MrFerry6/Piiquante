
const Sauce = require('../models/sauce');

module.exports = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId !== req.auth.userId) {
                console.log('Error: Element not created by user !!!')
                return res.status(401).json({
                    error: new Error('Unauthorized').message
                })
            }
            else{
                next();
            }
        })
        .catch(() => {
            console.log('Error: Sauce not found !!!')
            res.status(404).json({
                error: new Error('Not found').message
            });
        }
        );
}
