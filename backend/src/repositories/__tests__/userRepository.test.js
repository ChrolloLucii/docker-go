import { describe, it, expect, beforeEach, vi } from 'vitest';
import userRepository from '../userRepository.js';
import db from '../../models/index.js';

describe('userRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('findByEmail возвращает пользователя по email', async () => {
    vi.spyOn(db.User, 'findOne').mockResolvedValue({ id: 1, email: 'a@a.a' });
    const user = await userRepository.findByEmail('a@a.a');
    expect(db.User.findOne).toHaveBeenCalledWith({ where: { email: 'a@a.a' } });
    expect(user).toEqual({ id: 1, email: 'a@a.a' });
  });

  it('create создаёт пользователя', async () => {
    vi.spyOn(db.User, 'create').mockResolvedValue({ id: 1 });
    const user = await userRepository.create({ username: 'u', email: 'a@a.a', passwordHash: 'h', role: 'user' });
    expect(db.User.create).toHaveBeenCalledWith({ username: 'u', email: 'a@a.a', passwordHash: 'h', role: 'user' });
    expect(user).toEqual({ id: 1 });
  });

  it('findById возвращает пользователя по id', async () => {
    vi.spyOn(db.User, 'findByPk').mockResolvedValue({ id: 1 });
    const user = await userRepository.findById(1);
    expect(db.User.findByPk).toHaveBeenCalledWith(1);
    expect(user).toEqual({ id: 1 });
  });
});
