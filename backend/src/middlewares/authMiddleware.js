import jwt from 'jsonwebtoken';
export default function authMiddleware(req,res, next){
    const auth = req.headers.authorization;
    if(!auth){
        return res.status(401).json({message: 'Unauthorized'});
    }
    const token = auth.split(' ')[1];
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: payload.id, email: payload.email, role: payload.role};
        next();
    }

    catch(err){
        return res.status(401).json({message: 'Invalid Token'});
    } 
}
