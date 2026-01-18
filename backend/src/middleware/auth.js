const jwt = require('jsonwebtoken');

// Validate JWT_SECRET exists
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('CRITICAL: JWT_SECRET is missing or too short! Must be at least 32 characters.');
    process.exit(1);
}

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Acesso não autorizado. Token ausente.'
            });
        }

        // Validate Bearer token format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido.'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        if (!token || token.length < 10) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }

        // Verify token with additional options
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'], // Explicitly specify allowed algorithms
            maxAge: '24h' // Token max age
        });

        // Validate token payload
        if (!decoded.id || !decoded.email) {
            return res.status(401).json({
                success: false,
                message: 'Token payload inválido.'
            });
        }

        // Check token expiration explicitly
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            return res.status(401).json({
                success: false,
                message: 'Token expirado.'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        // Provide specific error messages
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor, faça login novamente.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Falha na autenticação.'
        });
    }
};

module.exports = authMiddleware;
