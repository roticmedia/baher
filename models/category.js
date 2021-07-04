module.exports = (sequelize, Sequelize, types) =>
    sequelize.define(
        "category",
        {
            name: {
                type: types.STRING,
                unique: {
                    args: true,
                    msg: "این دسته بندی از قبل وجود دارد"
                }
            },
            slug: {
                type: types.STRING
            },
            parent_id: {
                type: types.INTEGER
            }
        },
        {
            underscored: true,
            timestamps: false
        }
    );
