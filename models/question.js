module.exports = (sequelize, Sequelize, types) => sequelize.define('Question', {
  text: types.STRING,
  difficulty: types.TINYINT,
  type: types.TINYINT,
  count: {
    type: types.INTEGER,
    defaultValue: 0,
  },
}, {
  underscored: true,
});
