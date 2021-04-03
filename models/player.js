module.exports = (sequelize, Sequelize, types) => sequelize.define('player', {
    name: {
        type: types.STRING,
    },
    username: {
        type: types.STRING,
        unique: {
            args: true,
            msg: 'این نام کاربری قبلا انتخاب شده است',
        },
    },
    email: {
        type: types.STRING,
    },
    phone: {
        type: types.STRING,
    },
    picture: {
        type: types.STRING,
    },
    match_id: {
        type: types.INTEGER,
    },
    matches_win: {
        type: types.INTEGER,
        defaultValue: 0,
    },
    country: {
        type: types.STRING,
    },
    password: {
        type: types.STRING,
    },
}, {
    underscored: true,
});
