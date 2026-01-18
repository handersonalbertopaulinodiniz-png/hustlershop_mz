const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
    }
};

module.exports = adminMiddleware;
