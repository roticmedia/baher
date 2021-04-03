const express = require('express');
const debug = require('debug')('game');
const _ = require('lodash');

const sql = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

/*
  should start a match
*/
router.post('/', auth, async (req, res, next) => {
    try {
        const questions = [];
        const {
            competitors, monasabat, coin_questions, foop_questions, award_title,
        } = req.body;
        const match = await sql.match.create({
            competitors: parseInt(competitors, 10) || 15,
            monasabat: monasabat || null,
            coin_questions: typeof coin_questions === 'number' ? parseInt(coin_questions, 10) : 30,
            foop_questions: typeof foop_questions === 'number' ? parseInt(foop_questions, 10) : 45,
            award_title: award_title || '',
        });

        const foop_count = match.get('foop_questions') / match.get('competitors');
        const coin_count = match.get('coin_questions') / match.get('competitors');

        const foops = await sql.question.findAll({
            where: {
                is_true: 0,
            },

            order: [
                ['used_times', 'ASC'],
            ],
            limit: match.get('foop_questions'),
        });
        const coins = await sql.question.findAll({
            where: {
                is_true: 1,
            },
            order: [
                ['used_times', 'ASC'],
            ],
            limit: match.get('coin_questions'),
        });

        for (let i = match.get('competitors') - 1; i >= 0; i--) {
            let rnd;
            for (let j = foop_count; j > 0; j--) {
                rnd = Math.floor(Math.random() * foops.length);
                questions[i] = [];
                questions[i].push(foops[rnd].toJSON());
                await foops[rnd].update({
                    last_used: new Date(),
                    match_id: match.get('id'),
                });
                await foops[rnd].increment('used_times', { by: 1 });
                foops.splice(rnd, 1);
            }
            for (let k = coin_count; k > 0; k--) {
                rnd = Math.floor(Math.random() * coins.length);
                questions[i] = [];
                questions[i].push(coins[rnd].toJSON());
                await coins[rnd].update({
                    last_used: new Date().toString(),
                    match_id: match.get('id'),
                });
                await coins[rnd].increment('used_times', { by: 1 });
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
        console.log(err);

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
