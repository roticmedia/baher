module.exports = (sequelize, Sequelize, types) => sequelize.define('q', {
  gameId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  questionId: {
    type: types.INTEGER,
    allowNull: false,
  },
  status: {
    type: types.TINYINT,
    defaultValue: 0,
  },
  user_answer: {
    type: types.STRING,
    defaultValue: '',
  },
}, {
  underscored: true,
});
