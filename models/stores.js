module.exports = function(sequelize, DataTypes) {
    var Store = sequelize.define("Store", {
        store_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        street: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zip: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Store.associate = function(models) {
        Store.hasMany(models.Product, {
            onDelete: "cascade"
        });
    };
    return Store;
};