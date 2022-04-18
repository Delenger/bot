"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SupportTemplate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SupportTemplate.init(
    {
      userID: DataTypes.BIGINT,
      title: DataTypes.TEXT,
      message: DataTypes.TEXT,
      countryCode: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      timestamps: false,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "SupportTemplate",
    }
  );
  return SupportTemplate;
};
