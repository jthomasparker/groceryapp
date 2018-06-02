module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userFirstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userLastName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    User.associate = function(models){
        User.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });
    };
    return User;
}