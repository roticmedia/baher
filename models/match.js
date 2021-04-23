module.exports = (sequelize, Sequelize, types) =>
    sequelize.define(
        "match",
        {
            competitors: {
                type: types.INTEGER,
                defaultValue: 15
            },
            status: {
                type: types.TINYINT,
                defaultValue: 2
            },
            player_id: {
                type: types.INTEGER
            },
            monasabat: {
                type: types.STRING,
                allowNull: true
            },
            coin_questions: {
                type: types.INTEGER,
                defaultValue: 30
            },
            foop_questions: {
                type: types.INTEGER,
                defaultValue: 45
            },
            winners: {
                type: types.INTEGER
            },
            award_title: {
                type: types.TEXT
            },
            game_token: {
                type: types.UUID,
                defaultValue: types.UUIDV4
            },
            created_at: {
                type: types.DATE,
                defaultValue: Sequelize.now
            }
        },
        {
            underscored: true,
            timestamps: false
        }
    );
