const express = require("express");
const { v4 } = require("uuid");
const { Op } = require("sequelize");

const sql = require("../models");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const matches = await sql.match.findAll({
            where: {
                status: {
                    [Op.not]: 3
                }
            },
            raw: true
        });
        const m = [];

        for (const match of matches) {
            m.push({
                ...match,
                questions: await sql.question.findAll({
                    where: {
                        match_id: match.id
                    },
                    order: ["is_true", "DESC"],
                    raw: true
                }),
                player: await sql.player.findOne({
                    where: {
                        match_id: match.id
                    },
                    raw: true
                })
            });
        }

        return res.json({
            data: {
                matches: m
            },
            msg: "پیدا شد",
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

router.get("/free", auth, async (req, res) => {
    try {
        const matches = await sql.match.findAll({
            where: {
                player_id: null,
                status: {
                    [Op.not]: 3
                }
            },
            raw: true
        });
        const m = [];

        for (const match of matches) {
            m.push({
                ...match,
                questions: await sql.question.findAll({
                    where: {
                        match_id: match.id
                    },
                    order: ["is_true", "DESC"],
                    raw: true
                }),
                player: await sql.player.findOne({
                    where: {
                        match_id: match.id
                    },
                    raw: true
                })
            });
        }

        return res.json({
            data: {
                matches: m
            },
            msg: "پیدا شد",
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

router.post("/", auth, async (req, res) => {
    try {
        const {
            competitors = 1,
            monasabat = null,
            coin_questions = 2,
            foop_questions = 5,
            award_title = ""
        } = req.body;

        const questions = [];
        const game_token = v4();

        const foops = await sql.question.findAll({
            where: {
                is_true: 0,
                match_id: null,
                player_id: null
            },
            order: [["used_times", "ASC"]],
            limit: Math.round(foop_questions)
        });
        const coins = await sql.question.findAll({
            where: {
                is_true: 1,
                match_id: null,
                player_id: null
            },
            order: [["used_times", "ASC"]],
            limit: Math.round(coin_questions)
        });

        if (coins.length < coin_questions || foops.length < foop_questions) {
            return res.json({
                data: {},
                msg: "سوال کافی نمی باشد",
                status: false
            });
        }

        const match = await sql.match.create({
            competitors,
            monasabat,
            coin_questions,
            foop_questions,
            award_title,
            status: 0,
            game_token
        });

        for (const coin of coins) {
            await coin.update({
                status: 2,
                match_id: match.get("id"),
                player_id: null,
                user_answer: null
            });
            questions.push(coin.toJSON());
        }
        for (const foop of foops) {
            await foop.update({
                status: 2,
                match_id: match.get("id"),
                player_id: null,
                user_answer: null
            });
            questions.push(foop.toJSON());
        }
        return res.json({
            data: {
                matches: [
                    {
                        match: {
                            ...match.toJSON(),
                            questions
                        }
                    }
                ]
            },
            msg: "ساخته شد",
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

router.post("/empty", async (req, res) => {
    try {
        const {
            competitors = 1,
            monasabat = null,
            coin_questions = 2,
            foop_questions = 5,
            award_title = ""
        } = req.body;

        const game_token = v4();

        const match = await sql.match.create({
            competitors,
            monasabat,
            coin_questions,
            foop_questions,
            award_title,
            status: 0,
            game_token
        });

        return res.json({
            data: {
                matches: [
                    {
                        match: {
                            ...match.toJSON(),
                            questions: []
                        }
                    }
                ]
            },
            msg: "یک بازی خالی ساخته شد",
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

router.post("/addQuestionToMatch", async (req, res) => {
    try {
        const { match_id, question_id } = req.body;

        if (
            typeof match_id === "undefined" &&
            typeof question_id === "undefined"
        ) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const question = await sql.question.findOne({
            where: {
                id: question_id
            }
        });

        if (!question) {
            return res.json({
                data: {},
                msg: "چنین سوالی وجود ندارد",
                status: false
            });
        }

        if (question.get("match_id")) {
            return res.json({
                data: {},
                msg: "سوال در حال استفاده است",
                status: false
            });
        }

        const match = await sql.match.findOne({
            where: {
                id: match_id
            }
        });

        if (!match) {
            return res.json({
                data: {},
                msg: "چنین مسابقه ای وجود ندارد",
                status: false
            });
        }

        const is_true = question.get("is_true");

        if (is_true === 1) {
            const coins = await sql.question.count({
                where: {
                    is_true: 1,
                    match_id
                }
            });

            if (coins >= match.get("coin_questions")) {
                return res.json({
                    data: {},
                    msg: "جای خالی برای این سوال وجود ندارد",
                    status: false
                });
            }
        } else if (is_true === 0) {
            const foops = await sql.question.count({
                where: {
                    is_true: 0,
                    match_id
                }
            });

            if (foops >= match.get("foop_questions")) {
                return res.json({
                    data: {},
                    msg: "جای خالی برای این سوال وجود ندارد",
                    status: false
                });
            }
        }

        await question.update({
            match_id,
            status: 2,
            user_answer: null,
            player_id: match.get("player_id")
        });

        return res.json({
            data: {},
            msg: "سوال با موفقیت اضافه شد",
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

router.post("/connect/:player_id/:match_id", auth, async (req, res) => {
    try {
        const match = await sql.match.findOne({
            where: {
                id: req.params.match_id
            }
        });

        if (match.get("player_id")) {
            return res.json({
                data: {},
                msg: "بازیکنی در حال حاضر در این مسابقه وجود دارد",
                status: false
            });
        }

        const player = await sql.player.findOne({
            where: {
                id: req.params.player_id
            }
        });

        if (player.get("match_id")) {
            return res.json({
                data: {},
                msg: "این بازیکن در حال حاضر در یک مسابقه شرکت کرده است",
                status: false
            });
        }

        await match.update({
            player_id: player.get("id"),
            status: 2
        });
        await player.update({
            match_id: match.get("id")
        });
        await sql.question.update(
            {
                player_id: player.get("id"),
                last_used: new Date().toDateString(),
                status: 3,
                used_times: sql.Sequelize.literal("used_times + 1")
            },
            {
                where: {
                    match_id: match.get("id")
                }
            }
        );

        return res.json({
            data: {},
            msg: "متصل شد",
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

/*
    should return a match by its id
 */
router.get("/:id", auth, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.json({
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const match = await sql.match.findOne({
            where: {
                id: req.params.id
            }
        });

        const player = sql.player.findOne({
            where: {
                match_id: match.get("id")
            },
            raw: true
        });

        const questions = await sql.question.findAll({
            where: {
                match_id: req.params.id
            },
            order: ["is_true", "DESC"],
            raw: true
        });

        return res.json({
            data: {
                match: {
                    ...match.toJSON(),
                    questions,
                    player
                }
            },
            msg: "پیدا شد",
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

router.delete("/all", auth, async (req, res) => {
    try {
        const matches = await sql.match.findAll({
            where: {
                status: {
                    [Op.or]: [2, 1, 0]
                }
            }
        });

        if (matches.length === 0) {
            return res.json({
                data: {},
                msg: "مسابقه ای وجود ندارد",
                status: false
            });
        }

        for (const match of matches) {
            await match.update({
                status: 3,
                player_id: null
            });

            const player = await sql.player.findOne({
                where: {
                    match_id: match.get("id")
                }
            });

            if (player) {
                await player.update({
                    match_id: null
                });

                const questions = await sql.question.findAll({
                    where: {
                        match_id: match.get("id")
                    }
                });

                const winner = questions.every(
                    (question) =>
                        question.get("user_answer") ===
                        question.get("question_answer")
                );

                if (winner) {
                    await player.update({
                        matches_win: sql.Sequelize.literal("matches_win + 1")
                    });
                }

                await sql.question.update(
                    {
                        player_id: null,
                        match_id: null,
                        user_answer: null,
                        status: 3
                    },
                    {
                        where: {
                            match_id: match.get("id")
                        }
                    }
                );
            }
        }
        return res.json({
            data: {},
            msg: "مسابقه با موفقیت بسته شد",
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

router.delete("/used", async (req, res) => {
    try {
        const matches = await sql.match.findAll({
            where: {
                status: 0,
                player_id: null
            }
        });

        for (const match of matches) {
            await sql.question.update(
                {
                    status: 3,
                    match_id: null
                },
                {
                    where: {
                        match_id: match.get("id")
                    }
                }
            );
        }

        await sql.match.update(
            {
                status: 3
            },
            {
                where: {
                    status: 0,
                    player_id: null
                }
            }
        );

        return res.json({
            data: {},
            msg: "سوالات بی استفاده ازاد شدند",
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

router.delete("/:id", auth, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.json({
                data: {},
                msg: "اطلاعات ناقص است",
                status: false
            });
        }

        const match = await sql.match.findOne({
            where: {
                id: req.params.id
            }
        });

        if (match.get("status") === 3) {
            return res.json({
                data: {},
                msg: "مسابقه پایان یافته است",
                status: false
            });
        }

        await match.update({
            status: 3,
            player_id: null
        });

        const player = await sql.player.findOne({
            where: {
                match_id: match.get("id")
            }
        });

        if (player) {
            await player.update({
                match_id: null
            });
        }

        const questions = await sql.question.findAll({
            where: {
                match_id: match.get("id")
            }
        });

        const winner = questions.every(
            (question) =>
                question.get("user_answer") === question.get("question_answer")
        );

        if (winner) {
            await player.update({
                matches_win: sql.Sequelize.literal("matches_win + 1")
            });
        }

        await sql.question.update(
            {
                player_id: null,
                match_id: null,
                user_answer: null,
                status: 3
            },
            {
                where: {
                    match_id: match.get("id")
                }
            }
        );

        return res.json({
            data: {},
            msg: "مسابقه با موفقیت بسته شد",
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
