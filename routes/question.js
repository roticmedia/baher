const express = require('express');
const { ValidationError } = require('sequelize');

const sql = require('../models');

const auth = require('../middlewares/auth');

const router = express.Router();

/*
  should add question
*/
router.post('/', auth, (async (req, res) => {
  try {
    const {
      text, difficulty, type, answer,
    } = req.body;
    if (!text || !difficulty || !type || !answer) {
      return res.json({
        msg: 'اطلاعات ناقص است',
        status: false,
      });
    }
    await sql.question.create({
      text,
      difficulty,
      type,
      answer,
    });
    return res.json({
      msg: 'سوال اضافه شد',
      status: true,
    });
  } catch (err) {
    console.log(err);

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
      if (req.body.text) question.text = req.body.text;
      if (req.body.difficulty) question.difficulty = req.body.difficulty;
      if (req.body.type) question.type = req.body.type;
      if (req.body.answer) question.answer = req.body.answer;

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
      msg: 'مشکلی در بروزرسانی سوال بوچود آمده است',
      status: false,
    });
  }
}));

module.exports = router;
