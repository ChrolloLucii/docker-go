import AuthService from '../services/authService.js';
export async function register(req,res, next){
    try {
        const {username, email, password} = req.body;
        const user = await AuthService.register({username, email, password});
        res.status(200).json(user);
    }
    catch(err){
        next(err);
    }
}

export async function login(req,res,next) {
    try { 
        const {email, password} = req.body;
        const result = await AuthService.login({email, password});
        res.json(result);
    }
    catch(err){
        next(err);
    }
}