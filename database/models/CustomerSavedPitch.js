'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerSavedPitch extends Model {

    static associate(models) {
      this.belongsTo(models.Customer, {as: "customer", foreignKey: "customer_id"})
      this.belongsTo(models.CustomerPitch, {as: "customer_pitch"})
    }
  };  
  CustomerSavedPitch.init({
    customer_id: DataTypes.STRING,
    customer_pitch_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'CustomerSavedPitch',
    tableName: 'customer_saved_pitches',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerSavedPitch;
};