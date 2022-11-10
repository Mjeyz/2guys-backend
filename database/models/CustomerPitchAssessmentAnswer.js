'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerPitchAssessmentAnswer extends Model {

    static associate(models) {
      // this.belongsTo(models.User, {as: "user"})
      // this.hasMany(models.CustomerPitchAssessmentAnswerProxy, {as: "CustomerPitchAssessmentAnswer_proxies"})
      // this.hasOne(models.CustomerPitchAssessmentAnswerSubscription, {as: "CustomerPitchAssessmentAnswer_subscription", foreignKey: 'CustomerPitchAssessmentAnswer_id',})
      // this.hasMany(models.CustomerSavedPitch, {as: "customer_saved_pitch"})
    }
  };  
  CustomerPitchAssessmentAnswer.init({
    customer_pitch_applicant_id: DataTypes.INTEGER,
    customer_pitch_assessment_question_id: DataTypes.INTEGER,
    customer_answer: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'CustomerPitchAssessmentAnswer',
    tableName: 'customer_pitch_assessment_answers',
    timestamps: false,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerPitchAssessmentAnswer;
};