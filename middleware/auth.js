const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    req.auth = { userId: userId};
    if (req.body.userId && req.body.userId !== userId) {   
      console.log('Error: Invalid user Id !!!')
      return res.status(401).json({
        error: new Error('Unauthorized').message
      });
    } 
    else{
      next();
    }
  } 
  catch {     
    console.log('Error: Unauthorized request !!!')
    res.status(401).json({
      error: new Error('Unauthorized').message
    });
  }
}