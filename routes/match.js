const express = require('express');
const debug = require('debug')('game');
const _ = require('lodash');
const { Op } = require('sequelize');

const sql = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

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

        const questions = await sql.question.findAll({
            where: {
                match_id: req.params.id,
            },
        });

        return res.json({
            match: match.toJSON(),
            questions,
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
