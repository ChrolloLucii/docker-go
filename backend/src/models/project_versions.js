'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectVersion extends Model {
    static associate(models) {
      ProjectVersion.belongsTo(models.Project, {
        foreignKey: 'projectId',
        as: 'project'
      });
    }
  }
  ProjectVersion.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'project_id'
    },
    snapshot: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ProjectVersion',
    tableName: 'project_versions',
    underscored: true,
    timestamps: true
  });
  return ProjectVersion;
};