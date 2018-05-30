module.exports = function(sequelize, DataTypes) {
    var Product = sequelize.define("Product", {
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        }
    });

    Product.associate = function(models){
        Product.belongsTo(models.Store, {
            foreignKey: {
                allowNull: false
            }
        });
    };
    return Product
}