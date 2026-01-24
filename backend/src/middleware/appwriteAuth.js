const { Client, Account } = require('node-appwrite');

const appwriteAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Acesso não autorizado. Token ausente.'
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido. Use Bearer <token>.'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        if (!token || token.length < 10) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }

        // Criar cliente Appwrite com JWT
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setJWT(token);

        const account = new Account(client);

        // Validar token com Appwrite
        const user = await account.get();

        // Adicionar informações do usuário ao request
        req.user = {
            id: user.$id,
            email: user.email,
            name: user.name,
            verified: user.emailVerification
        };

        req.appwriteClient = client;

        next();
    } catch (error) {
        console.error('Appwrite auth middleware error:', error.message);
        
        if (error.code === 401) {
            return res.status(401).json({
                success: false,
                message: 'Token expirado ou inválido. Por favor, faça login novamente.'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Falha na autenticação com Appwrite.'
        });
    }
};

module.exports = appwriteAuthMiddleware;
