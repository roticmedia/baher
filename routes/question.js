const express = require("express");
const { ValidationError, Op } = require("sequelize");

const sql = require("../models");

const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/all", auth, async (req, res) => {
    try {
        let { page } = req.query;
        if (page) {
            const count = await sql.question.count();
            const totalPages = Math.round(count / 50);
            if (page > totalPages) {
                page = totalPages;
            }
            const questions = await sql.question.findAll({
                order: [["id", "ASC"]],
                offset: page * 50,
                limit: 50,
                raw: true
            });

            return res.json({
                data: {
                    questions,
                    total_pages: totalPages,
                    page
                },
                msg: "پیدا شد",
                status: true
            });
        }
        const questions = (await sql.question.findAll({ raw: true })) || [];
        return res.json({
            data: {
                questions
            },
            msg: "",
            status: true
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: "مشکلی در پیدا کردن سوال بوجود آمده است",
            status: false
        });
    }
});

/*
  should add question
*/
router.post("/", auth, async (req, res) => {
    try {
        const {
            title,
            hardness,
            question_answer,
            is_true,
            status = 0,
            score = 0,
            option_1 = null,
            option_2 = null,
            option_3 = null,
            option_4 = null
        } = req.body;
        if (
            !title ||
            typeof hardness === "undefined" ||
            typeof question_answer === "undefined" ||
            typeof is_true === "undefined"
        ) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const question = await sql.question.create({
            title: title.replace(/\s+/g, " ").trim(),
            hardness,
            is_true,
            question_answer,
            option_1,
            option_2,
            option_3,
            option_4,
            score,
            status
        });

        return res.json({
            data: { id: question.get("id") },
            msg: "سوال اضافه شد",
            status: true
        });
    } catch (err) {
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

router.get("/category", async (req, res) => {
    try {
        const { category_id } = req.body;

        if (category_id == undefined) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const questions =
            (await sql.question.findAll({
                where: {
                    category_id
                },
                raw: true
            })) || [];
        return res.json({
            data: {
                questions
            },
            msg: "",
            status: true
        });
    } catch (err) {
        console.log(err.stack);
        return res.json({
            data: {},
            msg: "مشکلی در پیدا کردن دسته بندی بوجود آمده است",
            status: false
        });
    }
});

router.post("/category", async (req, res) => {
    try {
        const { id, category_id } = req.body;

        if (id == undefined || category_id == undefined) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const question = await sql.question.findOne({
            where: id
        });

        if (!question) {
            return res.json({
                data: {},
                msg: "چنین سوالی وجود ندارد",
                status: false
            });
        }

        const category = await sql.category.findOne({
            where: {
                id: category_id
            }
        });

        if (!category) {
            return res.json({
                data: {},
                msg: "چنین دسته بندی وجود ندارد",
                status: false
            });
        }

        await question.update(
            {
                category_id: category.get("id"),
                category_name: category.get("name")
            },
            {
                where: {
                    id
                }
            }
        );

        return res.json({
            data: {},
            msg: "دسته بندی با موفقیت اضافه یا بروزرسانی شد",
            status: true
        });
    } catch (err) {
        console.log(err.stack);
        return res.json({
            data: {},
            msg: "مشکلی در اضافه کردن دسته بندی به سوال بوجود آمده است",
            status: false
        });
    }
});

/*
  should update question
*/
router.put("/", auth, async (req, res) => {
    try {
        if (!req.body.id) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const {
            title,
            hardness,
            question_answer,
            is_true,
            status,
            score,
            option_1,
            option_2,
            option_3,
            option_4,
            user_answer
        } = req.body;

        const question = await sql.question.findOne({
            where: {
                id: req.body.id
            }
        });

        if (!question) {
            return res.json({
                data: {},
                msg: "سوال پیدا نشد",
                status: false
            });
        }

        if (title) question.title = title.replace(/\s+/g, " ").trim();
        if (typeof hardness !== "undefined") question.hardness = hardness;
        if (typeof is_true !== "undefined") question.is_true = is_true;
        if (typeof question_answer !== "undefined")
            question.question_answer = question_answer;
        if (typeof score !== "undefined") question.score = score;
        if (typeof status !== "undefined") question.status = status;

        if (option_1) question.option_1 = option_1;
        if (option_2) question.option_2 = option_2;
        if (option_3) question.option_3 = option_3;
        if (option_4) question.option_4 = option_4;

        if (typeof user_answer !== "undefined")
            question.user_answer = user_answer;

        if (title === "") question.title = null;
        if (hardness === "") question.hardness = null;
        if (is_true === "") question.is_true = null;
        if (question_answer === "") question.question_answer = null;
        if (score === "") question.score = null;
        if (status === "") question.status = null;

        if (option_1 === "") question.option_1 = null;
        if (option_2 === "") question.option_2 = null;
        if (option_3 === "") question.option_3 = null;
        if (option_4 === "") question.option_4 = null;

        if (user_answer === "") question.user_answer = null;

        await question.save();

        return res.json({
            data: {},
            msg: "سوال بروزرسانی شد",
            status: true
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.json({
                msg: err.errors[0].message[0],
                data: {},
                status: false
            });
        }
        return res.json({
            data: {},
            msg: "مشکلی در بروزرسانی سوال بوجود آمده است",
            status: false
        });
    }
});

router.delete("/delete/:id", auth, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }
        const question = await sql.question.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!question) {
            return res.json({
                data: {},
                msg: "سوال پیدا نشد",
                status: true
            });
        }

        if (
            question.get("player_id") != null ||
            question.get("match_id") != null
        ) {
            return res.json({
                data: {},
                msg: "سوال در حال استفاده است",
                status: true
            });
        }

        await question.destroy();

        return res.json({
            data: {},
            msg: "سوال با موفقیت حذف شد",
            status: true
        });
    } catch (err) {
        return res.json({
            data: {},
            msg: "مشکلی در حذف سوال بوجود آمده است",
            status: false
        });
    }
});

router.post("/search", async (req, res) => {
    try {
        const { q } = req.body;

        if (q == undefined) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const questions = await sql.question.findAll({
            where: {
                title: {
                    [Op.substring]: q.trim()
                }
            },
            raw: true
        });

        return res.json({
            data: {
                questions
            },
            msg: "",
            status: true
        });
    } catch (err) {
        console.log(err);
        return res.json({
            data: {},
            msg: "مشکلی در جست و جو سوال بوجود آمده است",
            status: false
        });
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        if (req.params.id) {
            const question = await sql.question.findOne({
                where: {
                    id: req.params.id
                }
            });
            if (question) {
                return res.json({
                    msg: "",
                    data: {
                        question: question.toJSON()
                    },
                    status: true
                });
            }
            return res.json({
                data: {},
                msg: "سوال پیدا نشد",
                status: false
            });
        }
        return res.json({
            data: {},
            msg: "اطلاعات ناقص است",
            status: false
        });
    } catch (err) {
        return res.json({
            data: {},
            msg: "مشکلی در پیدا کردن سوال بوجود آمده است",
            status: false
        });
    }
});

module.exports = router;
