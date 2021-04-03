const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const jwtConfig = require('../config/jsonWebToken');
const auth = require('../middlewares/auth');

/**
 * @api {get} /auth
 * @apiName Authentication
 */
router.get('/', (req, res) => {
  try {
    jwt.sign({}, jwtConfig.secret, {}, (err, token) => {
      if (err) return res.json({ error: err });
      return res.json({ token });
    });
  } catch (err) {
    if (err) return res.json({ error: err });
  }
});

router.get('/test', auth, (req, res, next) => {
  res.send('test');
});

module.exports = router;
