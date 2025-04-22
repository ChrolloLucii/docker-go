import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ProjectMember extends Model {
    static associate(models) {
      // Можно добавить ассоциации, если нужно
    }
  }
  ProjectMember.init({
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ProjectMember',
    tableName: 'project_members',
    underscored: true,
    timestamps: true
  });
  return ProjectMember;
};