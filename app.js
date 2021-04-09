const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
}).single('picture');

const matchRouter = require('./routes/match');
const questionRouter = require('./routes/question');
const authRouter = require('./routes/auth');
const gameRouter = require('./routes/game');
const playerRouter = require('./routes/player');

const sql = require('./models');

const app = express();

// mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false', { useNewUrlParser: true, useUnifiedTopology: true })
//     .catch((err) => {
//         debug(err);
//     });
//
// sql.sequelize.sync({ force: true });

if (!process.env.TEST) app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload);
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

app.use('/match', matchRouter);
app.use('/question', questionRouter);
app.use('/auth', authRouter);
app.use('/game', gameRouter);
app.use('/player', playerRouter);

app.use((req, res, next) => {
    res.status(404);

    if (req.accepts('json')) {
        res.json({
            msg: 'not found',
            status: false,
        });
        return;
    }

    res.type('txt').send('Not found');
});

module.exports = app;
