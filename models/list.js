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
        List.belongsTo(models.User, {
            foreignKey: 'UserId'
        });
        // models.User.hasMany(List, {
        //     foreignKey: 'UserId'
        // });
        List.belongsTo(models.Product, {
            foreignKey: 'ProductId'
        });
    };

    return List;
}