
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from '../../middlewares/connectDatabase'
import type { StandardResponse } from '../../types/StandardResponse';


const Login = (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse>
) => {
    if (req.method === 'POST') {
        const { login, senha } = req.body;

        if (login === 'admin@admin.com' && senha === 'admin@123') {
            return res.status(200).json({ msg: 'Login realizado com sucesso!' });
        }
        return res.status(400).json({ error: 'Login ou senha inválidos' });
    }
    return res.status(405).json({ error: 'Metodo não permitido' });
}

export default connectDatabase(Login);