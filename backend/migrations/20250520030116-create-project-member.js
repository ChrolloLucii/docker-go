export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('project_members', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: 'editor',
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('project_members');
}