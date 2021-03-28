const express = require('express');

const router = express.Router();
const auth = require('../middlewares/auth');

/*
  should start a game
*/
router.get('/', (req, res, next) => {
  res.send('start');
});

/*
  should finish a game
*/
router.delete('/', (req, res, next) => {
  res.send('finish');
});

module.exports = router;
