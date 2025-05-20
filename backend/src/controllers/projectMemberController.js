import db from '../models/index.js';
export async function getProjectMembers(req, res) {
  const { projectId } = req.params;
  const members = await db.ProjectMember.findAll({
    where: { projectId },
    include: [{ model: db.User, attributes: ['id', 'email', 'username', 'role'] }]
  });
  res.json(members);
}

// Добавить участника в проект
export async function addProjectMember(req, res) {
  const { projectId } = req.params;
  const { userId, role } = req.body;
  const member = await db.ProjectMember.create({ projectId, userId, role: role || 'editor' });
  res.status(201).json(member);
}

// Удалить участника из проекта
export async function removeProjectMember(req, res) {
  const { projectId, userId } = req.params;
  await db.ProjectMember.destroy({ where: { projectId, userId } });
  res.json({ message: "Участник удалён" });
}
export async function addProjectMemberByUsername(req, res) {
  const { projectId } = req.params;
  const { username, role } = req.body;


  const user = await db.User.findOne({ where: { username } });
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });


  const exists = await db.ProjectMember.findOne({ where: { projectId, userId: user.id } });
  if (exists) return res.status(400).json({ error: "Пользователь уже участник проекта" });

 
  const member = await db.ProjectMember.create({
    projectId,
    userId: user.id,
    role: role || 'editor'
  });
  res.status(201).json(member);
}