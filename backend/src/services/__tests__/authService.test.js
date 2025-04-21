jest.mock('../../models/index.js');

import AuthService from '../authService.js';
import { User } from '../../models/index.js';

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
    describe('register', () => {
      it('should throw if fields are missing', async () => {
        await expect(AuthService.register({})).rejects.toThrow('All fields are required');
      });
  
      it('should throw if email already registered', async () => {
        User.findOne.mockResolvedValue({ id: 1 });
        await expect(AuthService.register({ username: 'a', email: 'a@a.a', password: '123' }))
          .rejects.toThrow('Email already registered');
      });
  
      it('should create user if data is valid', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({ id: 1, username: 'a', email: 'a@a.a' });
        const result = await AuthService.register({ username: 'a', email: 'a@a.a', password: '123' });
        expect(result).toEqual({ id: 1, username: 'a', email: 'a@a.a' });
      });
    });
  
    describe('login', () => {
      it('should throw if user not found', async () => {
        User.findOne.mockResolvedValue(null);
        await expect(AuthService.login({ email: 'a@a.a', password: '123' }))
          .rejects.toThrow('Invalid credentials');
      });
  
      it('should throw if password is invalid', async () => {
        User.findOne.mockResolvedValue({ passwordHash: 'wrong' });
        jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);
        await expect(AuthService.login({ email: 'a@a.a', password: '123' }))
          .rejects.toThrow('Invalid credentials');
      });
  
      it('should return token if credentials are valid', async () => {
        User.findOne.mockResolvedValue({ id: 1, email: 'a@a.a', role: 'user', passwordHash: 'hash' });
        jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
        jest.spyOn(require('jsonwebtoken'), 'sign').mockReturnValue('token');
        const result = await AuthService.login({ email: 'a@a.a', password: '123' });
        expect(result).toEqual({ token: 'token' });
      });
    });
  });