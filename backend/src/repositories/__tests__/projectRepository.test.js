import { describe, it, expect, beforeEach, vi } from 'vitest';
import projectRepository from '../projectRepository.js';
import db from '../../models/index.js';

const mockProject = { update: vi.fn(), destroy: vi.fn() };

describe('projectRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('findAllWithMembersByUser возвращает проекты пользователя с участниками', async () => {
    vi.spyOn(db.Project, 'findAll').mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const projects = await projectRepository.findAllWithMembersByUser(123);
    expect(db.Project.findAll).toHaveBeenCalledWith({
      where: {},
      include: [
        {
          model: db.ProjectMember,
          as: 'projectMembers',
          where: { userId: 123 },
          required: false
        }
      ],
    });
    expect(projects).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('findByIdAndOwner возвращает проект по id и ownerId', async () => {
    vi.spyOn(db.Project, 'findOne').mockResolvedValue({ id: 1 });
    const project = await projectRepository.findByIdAndOwner(1, 123);
    expect(db.Project.findOne).toHaveBeenCalledWith({ where: { id: 1, ownerId: 123 } });
    expect(project).toEqual({ id: 1 });
  });

  it('create создаёт новый проект', async () => {
    vi.spyOn(db.Project, 'create').mockResolvedValue({ id: 1 });
    const project = await projectRepository.create({ name: 'Test', description: 'desc', ownerId: 123 });
    expect(db.Project.create).toHaveBeenCalledWith({ name: 'Test', description: 'desc', ownerId: 123 });
    expect(project).toEqual({ id: 1 });
  });

  it('update обновляет проект', async () => {
    mockProject.update.mockResolvedValue({ id: 1, name: 'new' });
    const updated = await projectRepository.update(mockProject, { name: 'new', description: 'd' });
    expect(mockProject.update).toHaveBeenCalledWith({ name: 'new', description: 'd' });
    expect(updated).toEqual({ id: 1, name: 'new' });
  });

  it('delete удаляет проект', async () => {
    mockProject.destroy.mockResolvedValue();
    const result = await projectRepository.delete(mockProject);
    expect(mockProject.destroy).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Project deleted successfully' });
  });
});
