import { projectService } from '../projectService.js';
import db from '../../models/index.js';

jest.mock('../../models/index.js', () => ({
  Project: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

const { Project } = db;

describe('projectService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all projects', async () => {
      const fake = [{ id: '1' }, { id: '2' }];
      Project.findAll.mockResolvedValue(fake);

      const res = await projectService.getAll();
      expect(Project.findAll).toHaveBeenCalledWith();
      expect(res).toBe(fake);
    });
  });

  describe('getAllPerUser', () => {
    it('should return only owner projects', async () => {
      const ownerId = 'u1';
      const fake = [{ ownerId }];
      Project.findAll.mockResolvedValue(fake);

      const res = await projectService.getAllPerUser(ownerId);
      expect(Project.findAll).toHaveBeenCalledWith({ where: { ownerId } });
      expect(res).toBe(fake);
    });
  });

  describe('getById', () => {
    it('should return project when found', async () => {
      const project = { id: 'p1', ownerId: 'u1' };
      Project.findOne.mockResolvedValue(project);

      const res = await projectService.getById('p1', 'u1');
      expect(Project.findOne).toHaveBeenCalledWith({ where: { id: 'p1', ownerId: 'u1' } });
      expect(res).toBe(project);
    });

    it('should throw 404 when not found', async () => {
      Project.findOne.mockResolvedValue(null);
      await expect(projectService.getById('p2', 'u2'))
        .rejects.toMatchObject({ message: 'Project not found', status: 404 });
    });
  });

  describe('create', () => {
    it('should call Project.create with correct fields', async () => {
      const payload = { name: 'A', description: 'D', ownerId: 'u1' };
      const created = { id: 'new', ...payload };
      Project.create.mockResolvedValue(created);

      const res = await projectService.create('A', 'D', 'u1');
      expect(Project.create).toHaveBeenCalledWith(payload);
      expect(res).toBe(created);
    });
  });

  describe('update', () => {
    it('should update and return the project', async () => {
      const orig = { id: 'p1', update: jest.fn().mockResolvedValue('updated') };
      jest.spyOn(projectService, 'getById').mockResolvedValue(orig);

      const res = await projectService.update('p1', { name: 'X', description: 'Y' }, 'u1');
      expect(projectService.getById).toHaveBeenCalledWith('p1', 'u1');
      expect(orig.update).toHaveBeenCalledWith({ name: 'X', description: 'Y' });
      expect(res).toBe('updated');
    });
  });

  describe('remove', () => {
    it('should destroy and return message', async () => {
      const inst = { id: 'p1', destroy: jest.fn().mockResolvedValue() };
      jest.spyOn(projectService, 'getById').mockResolvedValue(inst);

      const res = await projectService.remove('p1', 'u1');
      expect(projectService.getById).toHaveBeenCalledWith('p1', 'u1');
      expect(inst.destroy).toHaveBeenCalled();
      expect(res).toEqual({ message: 'Project deleted successfully' });
    });

    it('should propagate error when not found', async () => {
      const err = new Error('nope');
      jest.spyOn(projectService, 'getById').mockRejectedValue(err);
      await expect(projectService.remove('p2', 'u2')).rejects.toBe(err);
    });
  });
});