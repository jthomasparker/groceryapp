module.exports = function(sequelize, DataTypes) {
    var Reference = sequelize.define("Reference", {
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        desc_walmart: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        desc_kroger: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        desc_publix: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    });

    
    return Reference;
}