module.exports = (sequelize, Sequelize, types) => sequelize.define('question', {
    match_id: {
        type: types.INTEGER,
    },
    status: {
        type: types.TINYINT,
        defaultValue: 1,
    },
    player_id: {
        type: types.INTEGER,
    },
    score: {
        type: types.INTEGER,
        defaultValue: 0,
    },
    title: {
        type: types.TEXT,
    },
    is_true: {
        type: types.TINYINT,
    },
    option_1: {
        type: types.TEXT,
        allowNull: true,
    },
    option_2: {
        type: types.TEXT,
        allowNull: true,
    },
    option_3: {
        type: types.TEXT,
        allowNull: true,
    },
    option_4: {
        type: types.TEXT,
        allowNull: true,
    },
    hardness: {
        type: types.TINYINT,
        validate: {
            between(value) {
                if (value < 0 || value > 3) {
                    throw new Error('مقادیر ورودی برای سختی غیرقابل قبول است');
                }
            },
        },
    },
    used_times: {
        type: types.INTEGER,
        defaultValue: 0,
    },
    last_used: {
        type: types.DATE,
        defaultValue: Sequelize.now,
    },
    question_answer: {
        type: types.TINYINT,
        allowNull: false,
        validate: {
            between(value) {
                if (value < 0 || value > 4) {
                    throw new Error('مقادیر ورودی برای پاسخ غیرقابل قبول است');
                }
            },
        },
    },
    user_answer: {
        type: types.TINYINT,
        defaultValue: -1,
    },
}, {
    timestamps: false,
});
