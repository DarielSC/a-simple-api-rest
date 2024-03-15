import jwt from 'jsonwebtoken'; // Asegúrate de importar jwt
import config from '../config';
import User from '../models/User';
import Role from '../models/Role'; // Asegúrate de importar Role si no está importado

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers["x-access-token"];

        if (!token) {
            return res.status(403).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, config.SECRET);
        req.userId = decoded.id;

        const user = await User.findById(req.userId, { password: 0 });
        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }

        next(); // Importante para pasar al siguiente middleware
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            // Manejar específicamente los errores de JWT
            return res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else {
            // Para otros tipos de errores
            return res.status(401).json({ message: 'Unauthorized', error: error.message });
        }
    }
};

// Función auxiliar para obtener roles del usuario
const getUserRoles = async (userId) => {
    const user = await User.findById(userId);
    const roles = await Role.find({ _id: { $in: user.roles } });
    return roles.map(role => role.name);
};

export const isAdmin = async (req, res, next) => {
    try {
        const roles = await getUserRoles(req.userId);
        if (!roles.includes('moderator') ||  !roles.includes('user')) {
            next();
            return;
        }
        return res.status(403).json({ message: "Requires Admin role" });
    } catch (error) {
        // Manejar errores aquí
        return res.status(500).json({ message: "Internal server error" });
    }
};
