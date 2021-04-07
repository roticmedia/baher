const express = require('express');
const { ValidationError } = require('sequelize');

const path = require('path');
const multer = require('multer');
const sql = require('../models');

const auth = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
}).single('picture');

const router = express.Router();

router.post('/', auth, (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.send(err);
            } if (err) {
                return res.send(err);
            }

            const {
                name, username, email, phone, country, password,
            } = req.body;

            if (!name || !username || !email || !phone || !country || !password || !req.file) {
                return res.json({
                    data: {},
                    msg: 'اطلاعات ناقص است',
                    status: false,
                });
            }
            await sql.player.create({
                name,
                username,
                email,
                phone,
                country,
                password,
                picture: req.file.path,
            });
            return res.json({
                data: {},
                msg: 'با موفقیت اضافه شد',
                status: true,
            });
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
