const express = require('express');
const debug = require('debug')('game');

const sql = require('../models');
const auth = require('../middlewares/auth');

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
router.delete('/', auth, async (req, res, next) => {
  try {
    const game = await sql.game.findOne({
      where: {
        id: req.body.id,
      },
    });

    if (game) {
      game.status = 1;

      await game.save();

      return res.json({
        msg: 'مسابقه با موفقیت به پایان رسید',
        status: true,
      });
    }
    return res.json({
      msg: 'مسابقه پیدا نشد',
      status: false,
    });
  } catch (err) {
    debug(err);

    return res.json({
      msg: 'مشکلی در پایان دادن مسابقه بوجود آمده است',
      status: false,
    });
  }
});

module.exports = router;
