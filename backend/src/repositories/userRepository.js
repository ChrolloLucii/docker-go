import db from '../models/index.js';
const { User } = db;

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async create({ username, email, passwordHash, role }) {
    return await User.create({ username, email, passwordHash, role });
  }

  async findById(id) {
    return await User.findByPk(id);
  }
}

export default new UserRepository();
