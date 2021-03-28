const jwt = require('jsonwebtoken');
const debug = require('debug')('auth');

const config = require('../config/jsonWebToken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('token');

    if (token) {
      jwt.verify(token, config.secret, {}, (err, decoded) => {
        if (err) res.status(402).json({ error: 'auth error' });
        else {
          req.data = decoded;
          next();
        }
      });
    } else {
      res.status(402).json({ error: 'auth error' });
    }
  } catch (err) {
    debug(err);
    res.status(402).send('error');
  }
};
