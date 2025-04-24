import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export default class AuthService {
    static async register({username, email, password}){
        if (!username || !email || !password){
            throw new Error('All fields are required');
        }
        const exists = await User.findOne({where :{email}});
        if (exists) {
            throw new Error('Email already registered');
        }
        const passwordHash = await bcrypt.hash(password,10);
        const user = await User.create({username, email, passwordHash, role: 'user'});
        return {id : user.id, username : user.username, email: user.email};
    }

    static async login({email, password}){
        const user =await User.findOne({where: {email}});

        if (!user){
            throw new Error('Invalid credentials');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { id : user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            {expiresIn : '1d'}
        );
        return {token};

    }

}