const express = require('express');
const debug = require('debug')('game');
const _ = require('lodash');

const sql = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

/*
  should start a game
*/
router.post('/', auth, async (req, res, next) => {
  try {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 15; i++) {
      const game = await sql.game.create({});

      const trueOfFalse = await sql.question.findAll({
        where: {
          type: 0,
        },
        order: [
          ['count', 'ASC'],
        ],
        limit: 4,
      });
      const fourAnswer = await sql.question.findAll({
        where: {
          type: 1,
        },
        order: [
          ['count', 'ASC'],
        ],
        limit: 2,
      });
      // eslint-disable-next-line no-restricted-syntax
      for (const question of fourAnswer) {
        await question.increment('count', { by: 1 });

        await sql.q.create({
          gameId: game.dataValues.id,
          questionId: question.dataValues.id,
        });
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const question of trueOfFalse) {
        await question.increment('count', { by: 1 });

        await sql.q.create({
          gameId: game.dataValues.id,
          questionId: question.dataValues.id,
        });
      }
    }

    return res.json({
      msg: 'مسابقه با موفقیت اضافه شد',
      status: true,
    });
  } catch (err) {
    debug(err);

    return res.json({
      msg: 'مشکلی در اضافه کردن مسابقه بوجود آمده است',
      status: false,
    });
  }
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
