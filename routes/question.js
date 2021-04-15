const express = require('express');
const { ValidationError } = require('sequelize');

const sql = require('../models');

const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/all', auth, async (req, res) => {
    try {
        const questions = await sql.question.findAll({ raw: true }) || [];
        return res.json({
            data: {
                questions,
            },
            msg: '',
            status: true,
        });
    } catch (err) {
        return res.json({
            data: {},
            msg: 'مشکلی در پیدا کردن سوال بوجود آمده است',
            status: false,
        });
    }
});

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
                    msg: '',
                    data: {
                        question: question.toJSON(),
                    },
                    status: true,
                });
            }
            return res.json({
                data: {},
                msg: 'سوال پیدا نشد',
                status: false,
            });
        }
        return res.json({
            data: {},
            msg: 'اطلاعات ناقص است',
            status: false,
        });
    } catch (err) {
        return res.json({
            data: {},
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
                data: {},
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }
        if (is_true === 0) {
            // eslint-disable-next-line max-len
            if (req.body.option_1 == null && req.body.option_2 == null && req.body.option_3 == null && req.body.option_4 == null) {
                return res.json({
                    data: {},
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
            data: {},
            msg: 'سوال اضافه شد',
            status: true,
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.json({
                msg: err.errors.map((error) => error.message),
                data: {},
                status: false,
            });
        }

        return res.json({
            data: {},
            msg: 'مشکلی در اضافه کردن سوال بوجود آمده است',
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
                data: {},
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }
        const question = await sql.question.findOne({
            where: {
                id: req.body.id,
            },
        });

        if (!question) {
            return res.json({
                data: {},
                msg: 'سوال پیدا نشد',
                status: false,
            });
        }

        if (req.body.title) question.title = req.body.title;
        if (req.body.hardness) question.hardness = req.body.hardness;
        if (req.body.is_true) question.is_true = req.body.is_true;
        if (req.body.question_answer) question.question_answer = req.body.question_answer;
        if (req.body.score) question.score = req.body.score;

        if (req.body.option_1) question.option_1 = req.body.option_1;
        if (req.body.option_2) question.option_2 = req.body.option_2;
        if (req.body.option_3) question.option_3 = req.body.option_3;
        if (req.body.option_4) question.option_4 = req.body.option_4;

        if (req.body.user_answer) question.user_answer = req.body.user_answer;

        await question.save();

        return res.json({
            data: {},
            msg: 'سوال بروزرسانی شد',
            status: true,
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.json({
                data: {},
                msg: err.errors,
                status: false,
            });
        }
        return res.json({
            data: {},
            msg: 'مشکلی در بروزرسانی سوال بوجود آمده است',
            status: false,
        });
    }
}));

router.delete('/delete/:id', auth, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.json({
                data: {},
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }
        const question = await sql.question.findOne({
            where: {
                id: req.params.id,
            },
        });
        if (!question) {
            return res.json({
                data: {},
                msg: 'سوال پیدا نشد',
                status: true,
            });
        }

        await question.destroy();

        return res.json({
            data: {},
            msg: 'سوال با موفقیت حذف شد',
            status: true,
        });
    } catch (err) {
        return res.json({
            data: {},
            msg: 'مشکلی در حذف سوال بوجود آمده است',
            status: false,
        });
    }
});

module.exports = router;
