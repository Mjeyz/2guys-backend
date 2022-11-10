'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerPitchAssessmentQuestion extends Model {

    static associate(models) {
      // this.belongsTo(models.User, {as: "user"})
      // this.hasMany(models.CustomerPitchAssessmentQuestionProxy, {as: "CustomerPitchAssessmentQuestion_proxies"})
      // this.hasOne(models.CustomerPitchAssessmentQuestionSubscription, {as: "CustomerPitchAssessmentQuestion_subscription", foreignKey: 'CustomerPitchAssessmentQuestion_id',})
      // this.hasMany(models.CustomerSavedPitch, {as: "customer_saved_pitch"})
    }
  };  
  CustomerPitchAssessmentQuestion.init({
    customer_pitch_id: DataTypes.INTEGER,
    question_title: DataTypes.STRING,
    question_order_num: DataTypes.INTEGER,
    question_optional: DataTypes.INTEGER,
    answer: {
      type: DataTypes.VIRTUAL,
      get() {
        return ""
      }
    },
  }, {
    sequelize,
    modelName: 'CustomerPitchAssessmentQuestion',
    tableName: 'customer_pitch_assesment_questions',
    timestamps: false,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerPitchAssessmentQuestion;
};