// backend/src/controllers/adminController.js
import db from '../models/index.js';
export async function getAllUsers(req, res) {
  const users = await db.User.findAll({ attributes: ['id', 'email', 'role'] });
  res.json(users);
}
export async function getAllProjects(req, res) {
  const projects = await db.Project.findAll({ attributes: ['id', 'name', 'ownerId'] });
  res.json(projects);
}
export async function deleteAnyProject(req, res) {
  const project = await db.Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ error: "Проект не найден" });
  await project.destroy();
  res.json({ message: "Проект удалён" });
}
export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  const user = await db.User.findByPk(id);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  user.role = role;
  await user.save();
  res.json({ message: "Роль обновлена" });
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  const user = await db.User.findByPk(id);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  await user.destroy();
  res.json({ message: "Пользователь удалён" });
}