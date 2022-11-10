'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerPitchApplyValidity extends Model {

    static associate(models) {
      this.belongsTo(models.CustomerPitch, {as: "customer_pitch_validity", foreignKey: "customer_pitch_id"})
    }
  };  
  CustomerPitchApplyValidity.init({
    customer_pitch_id: DataTypes.STRING,
    post_validity: DataTypes.STRING,
    total_applicant: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'CustomerPitchApplyValidity',
    tableName: 'customer_pitch_apply_validities',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerPitchApplyValidity;
};