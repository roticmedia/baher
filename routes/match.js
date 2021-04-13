const express = require('express');
const debug = require('debug')('game');
const { v4 } = require('uuid');
const _ = require('lodash');
const { Op } = require('sequelize');

const sql = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const matches = await sql.match.findAll({
            where: {
                status: {
                    [Op.or]: [0, 1, 2],
                },
            },
            raw: true,
        });
        const m = [];

        for (const match of matches) {
            m.push({
                ...match,
                questions: await sql.question.findAll({
                    where: {
                        match_id: match.id,
                    },
                    raw: true,
                }),
                player: await sql.player.findOne({
                    where: {
                        match_id: match.id,
                    },
                    raw: true,
                }),
            });
        }

        return res.json({
            data: {
                matches: m,
            },
            msg: 'پیدا شد',
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

router.get('/free', auth, async (req, res) => {
    try {
        const matches = await sql.match.findAll({
            where: {
                status: 0,
            },
            raw: true,
        });
        const m = [];

        for (const match of matches) {
            m.push({
                ...match,
                questions: await sql.question.findAll({
                    where: {
                        match_id: match.id,
                    },
                    raw: true,
                }),
                player: await sql.player.findOne({
                    where: {
                        match_id: match.id,
                    },
                    raw: true,
                }),
            });
        }

        return res.json({
            data: {
                matches: m,
            },
            msg: 'پیدا شد',
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

router.post('/', auth, async (req, res) => {
    try {
        const {
            competitors = 1, monasabat = null, coin_questions = 2, foop_questions = 5, award_title = '',
        } = req.body;

        const questions = [];
        const game_token = v4();

        const match = await sql.match.create({
            competitors,
            monasabat,
            coin_questions,
            foop_questions,
            award_title,
            status: 0,
            game_token,
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
            limit: parseInt(foop_questions, 10),
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
            limit: parseInt(coin_questions, 10),
        });

        if (coins.length < coin_questions || foops.length < foop_questions) {
            return res.json({
                data: {},
                msg: 'سوال کافی نمی باشد',
                status: false,
            });
        }

        for (const coin of coins) {
            await coin.update({
                status: 2,
                match_id: match.get('id'),
                player_id: null,
                user_answer: null,
            });
            questions.push(coin.toJSON());
        }
        for (const foop of foops) {
            await foop.update({
                status: 2,
                match_id: match.get('id'),
                player_id: null,
                user_answer: null,
            });
            questions.push(foop.toJSON());
        }
        return res.json({
            data: {
                matches: [
                    {
                        match: {
                            ...match.toJSON(),
                            questions,
                        },
                    },
                ],
            },
            msg: 'ساخته شد',
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

router.post('/:player_id/:match_id', auth, async (req, res) => {
    try {
        const match = await sql.match.findOne({
            where: {
                id: req.params.match_id,
            },
        });

        if (match.get('player_id') !== null) {
            return res.json({
                data: {},
                msg: 'بازیکنی در حال حاضر در این مسابقه وجود دارد',
                status: false,
            });
        }

        const player = await sql.player.findOne({
            where: {
                id: req.params.player_id,
            },
        });

        if (player.get('match_id') !== null) {
            return res.json({
                data: {},
                msg: 'این بازیکن در حال حاضر در یک مسابقه شرکت کرده است',
                status: false,
            });
        }

        await match.update({
            player_id: req.params.player_id,
            status: 1,
        });
        await player.update({
            match_id: req.params.match_id,
        });
        await sql.question.update({
            player_id: req.params.player_id,
        }, {
            where: {
                match_id: req.params.match_id,
            },
        });

        return res.json({
            data: {},
            msg: 'متصل شد',
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
    should return a match by its id
 */
router.get('/:id', auth, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.json({
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }

        const match = await sql.match.findOne({
            where: {
                id: req.params.id,
            },
        });

        if (match.get('status') === 3) {
            return res.json({
                msg: 'این مسابقه به پایان رسیده است',
                status: false,
            });
        }

        const player = sql.player.findOne({
            where: {
                match_id: match.get('id'),
            },
            raw: true,
        });

        const questions = await sql.question.findAll({
            where: {
                match_id: req.params.id,
            },
            raw: true,
        });

        return res.json({
            data: {
                match: {
                    ...match.toJSON(),
                    questions,
                    player,
                },
            },
            msg: 'پیدا شد',
            status: true,
        });
    } catch (err) {
        console.log(err);
        return res.json({
            msg: 'مشکلی بوجود آمده است',
            status: false,
        });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.json({
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }

        const match = await sql.match.findOne({
            where: {
                id: req.params.id,
            },
        });

        if (match.get('status') === 3) {
            return res.json({
                msg: 'این مسابقه به پایان رسیده است',
                status: false,
            });
        }

        await match.update({
            status: 3,
            player_id: null,
        });

        await sql.player.update({
            match_id: null,
        }, {
            where: {
                match_id: match.get('id'),
            },
        });

        await sql.question.update({
            player_id: null,
            match_id: null,
            user_answer: null,
            status: 3,
        }, {
            where: {
                match_id: match.get('id'),
            },
        });

        return res.json({
            msg: 'مسابقه با موفقیت بسته شد',
            status: true,
        });
    } catch (err) {
        console.log(err);
        return res.json({
            msg: 'مشکلی بوجود آمده است',
            status: false,
        });
    }
});

module.exports = router;
