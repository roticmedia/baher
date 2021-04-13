const express = require('express');
const { ValidationError } = require('sequelize');
const { Op } = require('sequelize');

const sql = require('../models');

const auth = require('../middlewares/auth');

const validate = require('../utils/validate');
const validatePlayer = require('../validate/Player');

const router = express.Router();

router.get('/available', auth, async (req, res) => {
    try {
        const availablePlayer = await sql.player.findAll({
            where: {
                match_id: null,
            },
            raw: true,
        });

        return res.json({
            data: {
                available_players: availablePlayer,
            },
            msg: '',
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
            name, username, email, phone, country, password,
        } = req.body;

        if (!name || !username || !email || !phone || !country || !password || !req.file) {
            return res.json({
                data: {},
                msg: 'اطلاعات ناقص است',
                status: false,
            });
        }

        if (!validate.validateFileType(req.file)) {
            return res.json({
                data: {},
                msg: 'فایل باید تصویر باشد',
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

router.put('/', auth, async (req, res) => {
    try {
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

        if (req.file && !validate.validateFileType(req.file)) {
            return res.json({
                data: {},
                msg: 'فایل باید تصویر باشد',
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
