module.exports = function(sequelize, DataTypes) {
    var List = sequelize.define("List", {
        list_name: {
            type: DataTypes.STRING,
            allowNull: false,
            valiate: {
                len: [1]
            }
        }        
    });

    List.associate = function(models){
        List.belongsTo(models.Product, {
            foreignKey: {
                allowNull: false
            }
        });
    };
    List.associate = function(models){
        List.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return List;
}