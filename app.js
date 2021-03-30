const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const debug = require('debug')('mongo');

const indexRouter = require('./routes/index');
const questionRouter = require('./routes/question');
const authRouter = require('./routes/auth');

const sql = require('./models');

const app = express();

mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false', { useNewUrlParser: true, useUnifiedTopology: true })
  .catch((err) => {
    debug(err);
  });

sql.sequelize.sync({ });

if (!process.env.TEST) app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/question', questionRouter);
app.use('/auth', authRouter);

module.exports = app;
