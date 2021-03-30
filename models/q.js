module.exports = (sequelize, Sequelize, types) => sequelize.define('q', {
  gameId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  questionId: {
    type: types.INTEGER,
    allowNull: false,
  },
  status: types.TINYINT,
}, {
  underscored: true,
});
