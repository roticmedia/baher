const express = require('express');
const { v4 } = require('uuid');
const { Op } = require('sequelize');

const sql = require('../models');

const auth = require('../middlewares/auth');

const router = express.Router();

/*
    should return current active game
 */
router.get('/', auth, async (req, res) => {
    try {
        const competitors = [];
        const matches = await sql.match.findAll({
            where: {
                status: 2,
            },
        });
        const questions = await sql.question.findAll({
            where: {
                match_id: {
                    [Op.not]: null,
                },
            },
            raw: true,
        });
        for (const match of matches) {
            competitors.push(await sql.player.findOne({
                where: {
                    id: match.get('player_id'),
                },
                raw: true,
            }));
        }
        if (competitors.length === 0) {
            return res.json({
                data: {},
                msg: 'مسابقه ای در حاضر موجود نیست',
                status: false,
            });
        }
        return res.json({
            msg: 'پیدا شد',
            data: {
                competitors,
                matches: matches.map((match) => match.toJSON()),
                questions,
            },
            status: true,
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: 'مشکلی بوجود آمده است',
            status: false,
        });
    }
});

/*
    should start a game
 */
router.post('/', auth, async (req, res) => {
    try {
        const {
            competitors = 15, monasabat = null, coin_questions = 30, foop_questions = 45, award_title = '',
        } = req.body;

        const game = await sql.match.findOne({
            where: {
                status: 2,
            },
        });

        if (game) {
            return res.json({
                data: {},
                msg: 'مسابقه قبلا شروع شده است',
                status: true,
            });
        }

        const game_token = v4();
        const foop_count = foop_questions / competitors;
        const coin_count = coin_questions / competitors;
        const players = await sql.player.findAll({
            where: {
                match_id: null,
            },
            order: sql.sequelize.random(),
            limit: parseInt(competitors, 10),
        });
        let questions = [];
        const matches = [];

        const foops = await sql.question.findAll({
            where: {
                is_true: 0,
            },
            order: [
                ['used_times', 'ASC'],
            ],
            limit: parseInt(foop_questions, 10),
        });
        const coins = await sql.question.findAll({
            where: {
                is_true: 1,
            },
            order: [
                ['used_times', 'ASC'],
            ],
            limit: parseInt(coin_questions, 10),
        });

        questions = questions.concat(foops.map((foop) => foop.toJSON()));
        questions = questions.concat(coins.map((coin) => coin.toJSON()));

        if (coins.length < coin_questions || foops.length < foop_questions) {
            return res.json({
                data: {},
                msg: 'سوال به تعداد کافی موجود نیست',
                status: false,
            });
        }
        for (let i = 0; i < competitors; i++) {
            const player = players[i];
            let player_id = null;
            let rnd;

            const match = await sql.match.create({
                competitors: parseInt(competitors, 10),
                monasabat,
                coin_questions: parseInt(coin_questions, 10),
                foop_questions: parseInt(foop_questions, 10),
                award_title,
                game_token,
                player_id: player ? player.get('id') : null,
            });

            matches.push(match.toJSON());

            if (player) {
                player_id = player.get('id');
                await player.update({
                    match_id: match.get('id'),
                });
            }

            for (let j = foop_count; j > 0; j--) {
                rnd = Math.floor(Math.random() * foops.length);
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
            msg: 'بازی با موفقیت اضافه شد',
            data: {
                competitors: players.map((player) => player.toJSON()),
                matches,
                questions,
            },
            status: true,
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: 'مشکلی بوجود آمده است',
            status: false,
        });
    }
});

/*
    should finish current game
 */
router.delete('/', auth, async (req, res) => {
    try {
        await sql.match.update({
            status: 3,
        }, {
            where: {
                status: 2,
            },
        });
        await sql.player.update({
            match_id: null,
        }, {
            where: {
                match_id: {
                    [Op.not]: null,
                },
            },
        });
        await sql.question.update({
            match_id: null,
        }, {
            where: {
                match_id: {
                    [Op.not]: null,
                },
            },
        });
        return res.json({
            data: {},
            msg: 'مسابقه پایان یافت',
            status: true,
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: 'مشکلی بوجود آمده است',
            status: false,
        });
    }
});

/*
    should add a player to empty slot
 */
router.post('/addPlayer', auth, async (req, res) => {
    try {
        if (!req.body.id) {
            return res.json({
                data: {},
                msg: 'اطلاعات ورودی ناقص است',
                status: false,
            });
        }

        const player = await sql.player.findOne({
            where: {
                id: req.body.id,
            },
        });

        if (!player) {
            return res.json({
                data: {},
                msg: 'بازیکن پیدا نشد',
                status: false,
            });
        }

        const match = await sql.match.findOne({
            where: {
                id: player.get('match_id'),
            },
        });

        if (match && match.get('status') !== 3) {
            return res.json({
                data: {},
                msg: 'بازیکن در مسابقه حضور دارد',
                status: false,
            });
        }

        const empty_match = await sql.match.findOne({
            where: {
                status: 2,
                player_id: null,
            },
        });
        if (empty_match) {
            await empty_match.update({
                player_id: req.body.id,
            });
            return res.json({
                data: {},
                msg: 'با موفقیت اضافه شد',
                status: true,
            });
        }

        return res.json({
            data: {},
            msg: 'مسابقه پر است',
            status: false,
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: 'مشکلی بوجود آمده است',
            status: false,
        });
    }
});

module.exports = router;
