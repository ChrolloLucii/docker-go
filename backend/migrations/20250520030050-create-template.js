export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Templates', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    category: Sequelize.STRING,
    content: Sequelize.TEXT,
    authorId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users', // имя таблицы!
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    rating: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('Templates');
}