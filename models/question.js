module.exports = (sequelize, Sequelize, types) => sequelize.define('Question', {
  text: types.STRING,
  difficulty: {
    type: types.TINYINT,
    validate: {
      between(value) {
        if (value < 0 || value > 3) {
          throw new Error('مقادیر ورودی برای سختی غیرقابل قبول است');
        }
      },
    },
  },
  type: {
    type: types.TINYINT,
    validate: {
      between(value) {
        if (value < 0 || value > 3) {
          throw new Error('مقادیر ورودی برای نوع غیرقابل قبول است');
        }
      },
    },
  },
  count: {
    type: types.INTEGER,
    defaultValue: 0,
  },
  answer: types.STRING,
}, {
  underscored: true,
});
