module.exports = (sequelize, Sequelize, types) =>
    sequelize.define(
        "question",
        {
            match_id: {
                type: types.INTEGER
            },
            status: {
                type: types.TINYINT,
                defaultValue: 1
            },
            player_id: {
                type: types.INTEGER
            },
            score: {
                type: types.INTEGER,
                defaultValue: 0
            },
            title: {
                type: types.STRING(200),
                unique: {
                    args: true,
                    msg: "سوال تکراری است"
                }
            },
            is_true: {
                type: types.TINYINT
            },
            option_1: {
                type: types.TEXT,
                allowNull: true
            },
            option_2: {
                type: types.TEXT,
                allowNull: true
            },
            option_3: {
                type: types.TEXT,
                allowNull: true
            },
            option_4: {
                type: types.TEXT,
                allowNull: true
            },
            hardness: {
                type: types.TINYINT
            },
            used_times: {
                type: types.INTEGER,
                defaultValue: 0
            },
            last_used: {
                type: types.DATE,
                defaultValue: Sequelize.now
            },
            question_answer: {
                type: types.TINYINT,
                allowNull: false
            },
            user_answer: {
                type: types.TINYINT,
                defaultValue: -1
            },
            category_id: {
                type: types.INTEGER
            },
            category_name: {
                type: types.STRING
            }
        },
        {
            timestamps: false
        }
    );
