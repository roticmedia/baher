const express = require("express");
const { ValidationError } = require("sequelize");
const { Op } = require("sequelize");

const sql = require("../models");

const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/all", auth, async (req, res) => {
    try {
        const players = (await sql.player.findAll({ raw: true })) || [];

        return res.json({
            data: {
                players
            },
            msg: "",
            status: true
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: "مشکلی بوجود آمده است",
            status: false
        });
    }
});

router.get("/available", auth, async (req, res) => {
    try {
        const availablePlayer = await sql.player.findAll({
            where: {
                match_id: null
            },
            raw: true
        });

        return res.json({
            data: {
                available_players: availablePlayer
            },
            msg: "",
            status: true
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: "مشکلی بوجود آمده است",
            status: false
        });
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        const player = await sql.player.findOne({
            where: {
                id: req.params.id
            },
            raw: true
        });

        if (!player) {
            return res.json({
                data: {},
                msg: "بازیکنی با این مشخصات وجود ندارد",
                status: false
            });
        }

        return res.json({
            data: {
                player
            },
            msg: "پیدا شد",
            status: false
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: "مشکلی بوجود آمده است",
            status: false
        });
    }
});

router.post("/", auth, async (req, res) => {
    try {
        const {
            name = null,
            username = null,
            email = null,
            phone = null,
            country = null,
            password = null
        } = req.body;
        let file = null;
        if (req.file && req.file.path) file = req.file && req.file.path;

        await sql.player.create({
            name,
            username,
            email,
            phone,
            country,
            password,
            picture: file
        });
        return res.json({
            data: {},
            msg: "با موفقیت اضافه شد",
            status: true
        });
    } catch (e) {
        if (e instanceof ValidationError) {
            return res.json({
                msg: e.errors[0].message,
                data: {},
                status: false
            });
        }
        console.log(e);
        return res.json({
            data: {},
            msg: "مشکلی بوجود آمده است",
            status: false
        });
    }
});

router.put("/", auth, async (req, res) => {
    try {
        const { name, email, phone, country, password, id } = req.body;
        let file = null;

        if (!id) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        if (req.file && req.file.path) file = req.file && req.file.path;

        const player = await sql.player.findOne({
            where: {
                id
            }
        });

        if (!player) {
            return res.json({
                data: {},
                msg: "بازیکن پیدا نشد",
                status: false
            });
        }

        if (name) player.name = name;
        if (email) player.email = email;
        if (phone) player.email = phone;
        if (country) player.country = country;
        if (password) player.password = password;
        if (file) player.picture = file;

        if (name === "") player.name = null;
        if (email === "") player.email = null;
        if (phone === "") player.email = null;
        if (country === "") player.country = null;
        if (password === "") player.password = null;

        await player.save();

        return res.json({
            data: {},
            msg: "با موفقیت بروزرسانی شد",
            status: true
        });
    } catch (e) {
        if (e instanceof ValidationError) {
            return res.json({
                msg: e.errors[0].message,
                data: {},
                status: false
            });
        }
        console.log(e);
        return res.json({
            data: {},
            msg: "مشکلی بوجود آمده است",
            status: false
        });
    }
});

router.put("/swap", async (req, res) => {
    try {
        const { player_1_id, player_2_id } = req.body;

        const player_1 = await sql.player.findOne({
            where: {
                id: player_1_id
            }
        });
        const player_2 = await sql.player.findOne({
            where: {
                id: player_2_id
            }
        });

        if (!player_1 || !player_2) {
            return res.json({
                data: {},
                msg: "یک یا هردو بازیکن وجود ندارند",
                status: false
            });
        }

        const temp_player_1 = player_1.get({ plain: true });
        const temp_player_2 = player_2.get({ plain: true });

        await player_2.destroy();
        await player_1.destroy();

        await sql.player.create({
            ...temp_player_1,
            id: temp_player_2.id
        });
        await sql.player.create({
            ...temp_player_2,
            id: temp_player_1.id
        });

        return res.json({
            data: {},
            msg: "جابجا شد",
            status: true
        });
    } catch (err) {
        console.log(e);
        return res.json({
            data: {},
            msg: "مشکلی بوجود آمده است",
            status: false
        });
    }
});

router.delete("/delete/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const player = await sql.player.findOne({
            where: {
                id
            }
        });

        if (!player) {
            return res.json({
                data: {},
                msg: "بازیکن پیدا نشد",
                status: false
            });
        }

        await sql.match.update(
            {
                player_id: null,
                status: 3
            },
            {
                where: {
                    player_id: player.get("id")
                }
            }
        );

        await sql.question.update(
            {
                player_id: null,
                match_id: null,
                status: 3
            },
            {
                player_id: player.get("id")
            }
        );

        await player.destroy();

        return res.json({
            data: {},
            msg: "با موفقیت حذف شد",
            status: true
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: "مشکلی بوجود آمده است",
            status: false
        });
    }
});

module.exports = router;
