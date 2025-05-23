import type { NextApiRequest, NextApiResponse } from 'next';
import type { StandardResponse } from '../../types/StandardResponse';
import { connectDatabase } from '../../middlewares/connectDatabase';
import { validateJWT } from '../../middlewares/validateJWT';
import { UserModel } from '../../models/UserModel';

const search = async (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse | any[]>
) => {
    try {

        if (req.method === 'GET') {

            const { filter } = req.query;
            if (!filter || filter.length < 2) {
                return res.status(400).json({ error: 'Dados infomados inválidos!' });
            }

            const usersFound = await UserModel.find({
                $or: [
                    { name: { $regex: filter, $options: 'i' } },
                    { email: { $regex: filter, $options: 'i' } }
                ]
            });

            return res.status(200).json([usersFound]);
        }

        return res.status(405).json({ error: 'Metódo não permitido.' });

    } catch (error) {

        console.log(error);
        return res.status(500).json({ error: 'Não foi possível realizar a busca' + error });
    }
}

export default validateJWT(connectDatabase(search));