
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import md5 from 'md5';
import { connectDatabase } from '../../middlewares/connectDatabase';
import type { StandardResponse } from '../../types/StandardResponse';
import type { LoginResponse } from '../../types/LoginResponse';
import { UserModel } from '../../models/UserModel';
import { corsPolicy } from '../../middlewares/corsPolicy';



const Login = async (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse | LoginResponse>
) => {

    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (req.method === 'POST') {
        const { login, password } = req.body;

        const findUsers = await UserModel.find({ email: login, password: md5(password) });

        if (findUsers && findUsers.length > 0) {

            const userLoged = findUsers[0];

            const token = jwt.sign({ _id: userLoged._id }, JWT_SECRET);

            return res.status(200).json({
                name: userLoged.name,
                email: userLoged.email,
                token
            });
        }
        return res.status(400).json({ error: 'Login ou senha inválidos' });
    }
    return res.status(405).json({ error: 'Metodo não permitido' });
}

export default corsPolicy(connectDatabase(Login));