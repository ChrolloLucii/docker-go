'use strict';
const {
  Model
} = require('sequelize');
const { Sequelize } = require('.');
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Project.associate = models => {
        Project.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
        Project.belongsToMany(models.User, {
          through: models.ProjectMember,
          foreignKey: 'projectId',
          otherKey: 'userId',
          as: 'members'
        });
        Project.hasMany(models.DockerFile, { foreignKey: 'projectId', as: 'dockerFiles' });
      };
    }
  }
  Project.init({
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    ownerId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    } 
  }, {
    sequelize,
    modelName: 'Project',
    underscored: true,
    tableName: 'projects',
    timestamps: true,
  });
  return Project;
};