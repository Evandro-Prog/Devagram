import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { StandardResponse } from '../types/StandardResponse';

export const validateJWT = (handler: NextApiHandler) => (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse>
) => {
    const { JWT_SECRET } = process.env;

    if (!JWT_SECRET) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!req || !req.headers) {
        return res.status(401).json({ error: 'Token de acesso não encontrado' });
    }

    if (req.method !== 'OPTIONS') {

        const authorization = req.headers['authorization'];
        if (!authorization) {
            return res.status(401).json({ error: 'Token de acesso não encontrado' });
        }

        const token = authorization.substring(7);
        if (!token) {
            return res.status(401).json({ error: 'Token de acesso não encontrado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (!decoded) {
            return res.status(401).json({ error: 'Token de acesso inválido' });
        }

        if (!req.query) {
            req.query = {};
        }

        req.query.userId = decoded._id;
    }

    return handler(req, res);
}

