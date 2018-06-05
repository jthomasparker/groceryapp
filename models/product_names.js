module.exports = function(sequelize, DataTypes) {
    var Productname = sequelize.define("Productname", {
            name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
    });
    Productname.associate = function(models) {
        Productname.hasMany(models.Reference, {
            onDelete: "cascade"
        });
    };

    return Productname;
}