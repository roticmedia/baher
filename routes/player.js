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
    upload(req, res, async (err) => {
        try {
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
        } catch (e) {
            if (e instanceof ValidationError) {
                return res.json({
                    msg: e.errors.map((error) => error.message),
                    data: {},
                    status: false,
                });
            }
            console.log(e);
            return res.json({
                data: {},
                msg: 'مشکلی بوجود آمده است',
                status: false,
            });
        }
    });
});

router.put('/', auth, async (req, res) => {
    upload(req, res, async (err) => {
        try {
            if (err instanceof multer.MulterError) {
                return res.send(err);
            } if (err) {
                return res.send(err);
            }

            const {
                name, email, phone, country, password, id,
            } = req.body;

            if (!id) {
                return res.json({
                    data: {},
                    msg: 'اطلاعات ناقص است',
                    status: false,
                });
            }

            const player = await sql.player.findOne({
                where: {
                    id,
                },
            });

            if (!player) {
                return res.json({
                    data: {},
                    msg: 'بازیکن پیدا نشد',
                    status: false,
                });
            }

            if (name) player.name = name;
            if (email) player.email = email;
            if (phone) player.email = phone;
            if (country) player.country = country;
            if (password) player.password = password;
            if (req.file) player.picture = req.file.path;

            await player.save();

            return res.json({
                data: {},
                msg: 'با موفقیت بروزرسانی شد',
                status: true,
            });
        } catch (e) {
            if (e instanceof ValidationError) {
                return res.json({
                    msg: e.errors.map((error) => error.message),
                    data: {},
                    status: false,
                });
            }
            console.log(e);
            return res.json({
                data: {},
                msg: 'مشکلی بوجود آمده است',
                status: false,
            });
        }
    });
});

router.delete('/', auth, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.json({
                data: {},
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }

        const player = await sql.player.findOne({
            where: {
                id,
            },
        });

        if (!player) {
            return res.json({
                data: {},
                msg: 'بازیکن پیدا نشد',
                status: false,
            });
        }

        await player.destroy();

        return res.json({
            data: {},
            msg: 'با موفقیت حذف شد',
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

module.exports = router;
