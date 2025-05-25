import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as projectMemberController from '../projectMemberController.js';
import db from '../../models/index.js';

const mockReq = (opts = {}) => ({
  params: {},
  body: {},
  user: {},
  app: { get: vi.fn() },
  ...opts,
});
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
const next = vi.fn();

describe('projectMemberController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addProjectMemberByUsername: приглашает нового пользователя', async () => {
    vi.spyOn(db.User, 'findOne').mockResolvedValue({ id: 1, username: 'user' });
    vi.spyOn(db.ProjectMember, 'findOne').mockResolvedValue(null);
    vi.spyOn(db.ProjectMember, 'create').mockResolvedValue({ id: 2, userId: 1, projectId: 3, role: 'editor' });

    const req = mockReq({
      params: { projectId: 3 },
      body: { username: 'user', role: 'editor' },
      user: { id: 99, username: 'admin' },
      app: { get: vi.fn(() => ({ notifyInvite: vi.fn() })) }
    });
    const res = mockRes();
    await projectMemberController.addProjectMemberByUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 2, userId: 1, projectId: 3, role: 'editor' });
  });

  it('addProjectMemberByUsername: не приглашает если пользователь уже участник', async () => {
    vi.spyOn(db.User, 'findOne').mockResolvedValue({ id: 1, username: 'user' });
    vi.spyOn(db.ProjectMember, 'findOne').mockResolvedValue({ id: 2 });
    vi.spyOn(db.ProjectMember, 'create').mockResolvedValue();

    const req = mockReq({
      params: { projectId: 3 },
      body: { username: 'user', role: 'editor' },
      user: { id: 99, username: 'admin' },
      app: { get: vi.fn(() => ({ notifyInvite: vi.fn() })) }
    });
    const res = mockRes();
    await projectMemberController.addProjectMemberByUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Пользователь уже участник проекта' });
  });

  it('addProjectMemberByUsername: не приглашает несуществующего пользователя', async () => {
    vi.spyOn(db.User, 'findOne').mockResolvedValue(null);
    vi.spyOn(db.ProjectMember, 'findOne').mockResolvedValue();
    vi.spyOn(db.ProjectMember, 'create').mockResolvedValue();

    const req = mockReq({
      params: { projectId: 3 },
      body: { username: 'nouser', role: 'editor' },
      user: { id: 99, username: 'admin' },
      app: { get: vi.fn(() => ({ notifyInvite: vi.fn() })) }
    });
    const res = mockRes();
    await projectMemberController.addProjectMemberByUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Пользователь не найден' });
  });
});