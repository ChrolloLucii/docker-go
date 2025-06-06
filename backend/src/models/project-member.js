import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ProjectMember extends Model {
    static associate(models) {
      ProjectMember.belongsTo(models.Project, { foreignKey: 'projectId' });
      ProjectMember.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  ProjectMember.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'editor',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'ProjectMember',
    tableName: 'project_members',
    underscored: true,
    timestamps: true,
  });

  return ProjectMember;
};