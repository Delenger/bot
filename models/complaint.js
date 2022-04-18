"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Complaint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Complaint.init(
    {
      userId: DataTypes.BIGINT,
      username: DataTypes.STRING,
      text: DataTypes.TEXT,
      isSolved: DataTypes.BOOLEAN,
      channelMessageId: DataTypes.BIGINT,
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Complaint",
    }
  );
  return Complaint;
};
