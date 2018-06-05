module.exports = function(sequelize, DataTypes) {
    var Reference = sequelize.define("Reference", {
        product_name: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [1]
            }
        },
        description : {
            type:DataTypes.STRING,
            allowNull: false
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
    })
    Reference.associate = function(models){
        Reference.belongsTo(models.Productname, {
            foreignKey: {
                allowNull: false
            },
            
        //}, models.Productname, {
         //   foreignKey: {
         //       allowNull: false
         //   },
        });
    };
    return Reference;
}