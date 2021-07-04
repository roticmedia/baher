const express = require("express");
const { ValidationError } = require("sequelize");

const db = require("../models");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { id } = req.body;

        if (id == undefined) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const category = await db.category.findOne({
            where: {
                id
            },
            raw: true
        });

        if (!category) {
            return res.json({
                data: {},
                msg: "دسته بندی پیدا نشد",
                status: false
            });
        }

        return res.json({
            data: {
                category
            },
            msg: "پیدا شد",
            status: true
        });
    } catch (err) {
        console.log(err.stack);
        return res.json({
            data: {},
            msg: "مشکلی در پیدا کردن سوال بوجود آمده است",
            status: false
        });
    }
});

router.get("/all", async (req, res) => {
    try {
        const category = await db.category.findAll({
            raw: true
        });

        return res.json({
            data: {
                category
            },
            msg: "پیدا شد",
            status: true
        });
    } catch (err) {
        console.log(err.stack);
        return res.json({
            data: {},
            msg: "مشکلی در پیدا کردن سوال بوجود آمده است",
            status: false
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, slug = null, parent_id = null } = req.body;

        if (name == undefined || name === "") {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        await db.category.create({
            name,
            slug,
            parent_id
        });

        return res.json({
            data: {},
            msg: "دسته بندی با موفقیت اضافه شد",
            status: true
        });
    } catch (err) {
        console.log(err.stack);
        if (err instanceof ValidationError) {
            return res.json({
                msg: err.errors[0].message,
                data: {},
                status: false
            });
        }

        return res.json({
            data: {},
            msg: "مشکلی در اضافه کردن سوال بوجود آمده است",
            status: false
        });
    }
});

router.delete("/", async (req, res) => {
    try {
        const { id } = req.body;

        if (id == undefined) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const category = await db.category.findOne({
            where: {
                id
            }
        });

        if (!category) {
            return res.json({
                data: {},
                msg: "دسته بندی پیدا نشد",
                status: false
            });
        }

        await category.destroy();

        return res.json({
            data: {},
            msg: "دسته بندی حذف شد",
            status: true
        });
    } catch (err) {
        console.log(err.stack);
        return res.json({
            data: {},
            msg: "مشکلی در حذف کردن سوال بوجود آمده است",
            status: false
        });
    }
});

router.put("/", async (req, res) => {
    try {
        const { id, name, slug, parent_id } = req.body;

        if (id == undefined) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const category = await db.category.findOne({
            where: {
                id
            }
        });

        if (!category) {
            return res.json({
                data: {},
                msg: "دسته بندی پیدا نشد",
                status: false
            });
        }

        if (name != undefined) category.name = name;
        if (slug != undefined) category.slug = slug;
        if (parent_id != undefined) category.parent_id = parent_id;

        await category.save();

        return res.json({
            data: {},
            msg: "دسته بندی بروزرسانی شد",
            status: true
        });
    } catch (err) {
        console.log(err.stack);
        return res.json({
            data: {},
            msg: "مشکلی در بروزرسانی کردن سوال بوجود آمده است",
            status: false
        });
    }
});

module.exports = router;
