const express = require('express');
const { ValidationError } = require('sequelize');

const sql = require('../models');

const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/:id', auth, async (req, res) => {
    try {
        if (req.params.id) {
            const question = await sql.question.findOne({
                where: {
                    id: req.params.id,
                },
            });
            if (question) {
                return res.json({
                    question: question.toJSON(),
                    status: true,
                });
            }
            return res.json({
                msg: 'سوال پیدا نشد',
                status: false,
            });
        }
        return res.json({
            msg: 'اطلاعات ناقص است',
            status: false,
        });
    } catch (err) {
        return res.json({
            msg: 'مشکلی در پیدا کردن سوال بوجود آمده است',
            status: false,
        });
    }
});

/*
  should add question
*/
router.post('/', auth, (async (req, res) => {
    try {
        const {
            title, hardness, question_answer, is_true,
        } = req.body;
        if (!title || typeof hardness === 'undefined' || typeof question_answer === 'undefined' || typeof is_true === 'undefined') {
            return res.json({
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }
        if (is_true === 0) {
            // eslint-disable-next-line max-len
            if (req.body.option_1 == null && req.body.option_2 == null && req.body.option_3 == null && req.body.option_4 == null) {
                return res.json({
                    msg: 'اطلاعات ناقص است',
                    status: false,
                });
            }
        }
        await sql.question.create({
            title,
            hardness,
            is_true,
            question_answer,
            option_1: req.body.option_1 ? req.body.option_1 : null,
            option_2: req.body.option_2 ? req.body.option_2 : null,
            option_3: req.body.option_3 ? req.body.option_3 : null,
            option_4: req.body.option_4 ? req.body.option_4 : null,
            score: req.body.score ? req.body.score : 0,
        });

        return res.json({
            msg: 'سوال اضافه شد',
            status: true,
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.json({
                msg: err.errors.map((error) => error.message),
                status: false,
            });
        }

        return res.json({
            msg: 'مشکلی در اضافه کردن سوال بوچود آمده است',
            status: false,
        });
    }
}));

/*
  should update question
*/
router.put('/', auth, (async (req, res) => {
    try {
        if (!req.body.id) {
            return res.json({
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }
        const question = await sql.question.findOne({
            where: {
                id: req.body.id,
            },
        });

        if (question) {
            if (req.body.title) question.title = req.body.title;
            if (req.body.hardness) question.hardness = req.body.hardness;
            if (req.body.is_true) question.is_true = req.body.is_true;
            if (req.body.question_answer) question.question_answer = req.body.question_answer;
            if (req.body.score) question.score = req.body.score;

            if (req.body.option_1) question.option_1 = req.body.option_1;
            if (req.body.option_2) question.option_2 = req.body.option_2;
            if (req.body.option_3) question.option_3 = req.body.option_3;
            if (req.body.option_4) question.option_4 = req.body.option_4;

            await question.save();

            return res.json({
                msg: 'سوال بروزرسانی شد',
                status: true,
            });
        }
        return res.json({
            msg: 'سوال پیدا نشد',
            status: false,
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.json({
                msg: err.errors,
                status: false,
            });
        }
        return res.json({
            msg: 'مشکلی در بروزرسانی سوال بوجود آمده است',
            status: false,
        });
    }
}));

router.delete('/', auth, async (req, res) => {
    try {
        if (req.body.id) {
            const question = await sql.question.findOne({
                where: {
                    id: req.body.id,
                },
            });
            if (question) {
                await question.destroy();
                return res.json({
                    msg: 'سوال با موفقیت حذف شد',
                    status: true,
                });
            }
            return res.json({
                msg: 'سوال پیدا نشد',
                status: true,
            });
        }
        return res.json({
            msg: 'سوال پیدا نشد',
            status: false,
        });
    } catch (err) {
        return res.json({
            msg: 'مشکلی در حذف سوال بوجود آمده است',
            status: false,
        });
    }
});

module.exports = router;
