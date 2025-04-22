import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Project.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
        Project.belongsToMany(models.User, {
          through: models.ProjectMember,
          foreignKey: 'projectId',
          otherKey: 'userId',
          as: 'members'
        });
        Project.hasMany(models.DockerFile, { foreignKey: 'projectId', as: 'dockerFiles' });
    }
  }
  Project.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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