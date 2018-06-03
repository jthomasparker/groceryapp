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
        },
        userEmailAddress: {
            type: DataTypes.STRING,
            allowNull: true
        }

    });
    return User;
}