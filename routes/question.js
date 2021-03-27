const express = require('express');

const router = express.Router();

/*
  should add question
*/
router.post('/', ((req, res) => {
  res.send('add');
}));

/*
  should update question
*/
router.put('/', ((req, res) => {
  res.send('update');
}));

module.exports = router;
