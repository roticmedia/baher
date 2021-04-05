const express = require('express');
const debug = require('debug')('game');
const _ = require('lodash');
const { Op } = require('sequelize');

const sql = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

/*
    should return all active matches
 */
router.get('/', auth, async (req, res) => {
    try {
        const active_matches = sql.match.findAll({
            where: {
                status: {
                    [Op.or]: [1, 2],
                },
            },
            raw: true,
        });

        return res.json({
            active_matches,
            status: true,
        });
    } catch (err) {
        debug(err);

        return res.json({
            msg: 'مشکلی بوجود آمده است',
            status: false,
        });
    }
});

/*
    should return a specific match
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const match = await sql.match.findByPk(req.params.id);

        if (match) {
            return res.json({
                match: match.toJSON(),
                status: true,
            });
        }
        return res.json({
            msg: 'مسابقه پیدا نشد',
            status: false,
        });
    } catch (err) {
        return res.json({
            msg: 'مشکلی بوجود آمده است',
            status: false,
        });
    }
});

/*
  should start a match
*/
router.post('/', auth, async (req, res, next) => {
    try {
        const {
            competitors = 15, monasabat = null, coin_questions = 30, foop_questions = 45, award_title = '',
        } = req.body;

        const match = await sql.match.create({
            competitors,
            monasabat,
            coin_questions,
            foop_questions,
            award_title,
        });

        const questions = _.fill(Array(match.get('competitors')), []);
        const foop_count = match.get('foop_questions') / match.get('competitors');
        const coin_count = match.get('coin_questions') / match.get('competitors');
        const players = await sql.player.findAll({
            where: {
                match_id: null,
            },
            order: sql.sequelize.random(),
            limit: match.get('competitors'),
        });

        const foops = await sql.question.findAll({
            where: {
                is_true: 0,
                status: {
                    [Op.or]: [0, 3],
                },
            },

            order: [
                ['used_times', 'ASC'],
            ],
            limit: match.get('foop_questions'),
        });
        const coins = await sql.question.findAll({
            where: {
                is_true: 1,
                status: {
                    [Op.or]: [0, 3],
                },
            },
            order: [
                ['used_times', 'ASC'],
            ],
            limit: match.get('coin_questions'),
        });

        if (coins.length < match.get('coin_questions') || foops.length < match.get('foop_questions')) {
            return res.json({
                msg: 'سوال به تعداد کافی موجود نیست',
                status: false,
            });
        }

        for (let i = match.get('competitors') - 1; i >= 0; i--) {
            const player = players[i];
            let player_id = null;
            let rnd;

            if (player) {
                player_id = player.get('id');
                await player.update({
                    match_id: match.get('id'),
                });
            }

            for (let j = foop_count; j > 0; j--) {
                rnd = Math.floor(Math.random() * foops.length);
                questions[i].push(foops[rnd].toJSON());
                await foops[rnd].update({
                    last_used: new Date(),
                    match_id: match.get('id'),
                    player_id,
                    used_times: sql.Sequelize.literal('used_times + 1'),
                });
                foops.splice(rnd, 1);
            }
            for (let k = coin_count; k > 0; k--) {
                rnd = Math.floor(Math.random() * coins.length);
                questions[i].push(coins[rnd].toJSON());
                await coins[rnd].update({
                    last_used: new Date().toString(),
                    match_id: match.get('id'),
                    player_id,
                    used_times: sql.Sequelize.literal('used_times + 1'),
                });
                coins.splice(rnd, 1);
            }
        }
        return res.json({
            msg: 'مسابقه با موفقیت اضافه شد',
            questions,
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
  should finish a match
*/
router.delete('/', auth, async (req, res, next) => {
    try {
        const match = await sql.match.findOne({
            where: {
                id: req.body.id,
            },
        });

        if (match) {
            match.status = 3;

            await match.save();

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
