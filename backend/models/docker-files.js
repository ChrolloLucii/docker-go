'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DockerFile extends Model {
    static associate(models) {
      DockerFile.belongsTo(models.Project, {
        foreignKey: 'projectId',
        as: 'project',
      });
    }
  }

  DockerFile.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'project_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  }, {
    sequelize,
    modelName: 'DockerFile',
    tableName: 'docker_files',
    underscored: true,
    timestamps: true,
  });

  return DockerFile;
};