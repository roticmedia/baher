const express = require('express');

const router = express.Router();

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
  res.send('delete');
});
module.exports = router;
