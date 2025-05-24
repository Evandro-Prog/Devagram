import type { NextApiRequest, NextApiResponse } from 'next';
import type { StandardResponse } from '../../types/StandardResponse';
import { connectDatabase } from '../../middlewares/connectDatabase';
import { validateJWT } from '../../middlewares/validateJWT';
import { UserModel } from '../../models/UserModel';
import { corsPolicy } from '../../middlewares/corsPolicy';

const search = async (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse | any[]>
) => {
    try {

        if (req.method === 'GET') {

            if (req?.query?.id) {
                const userFound = await UserModel.findById(req?.query?.id);
                if (!userFound) {

                    return res.status(400).json({ error: 'Usuário não encontrado!' });
                }

                userFound.password = null;
                return res.status(200).json(userFound);

            } else {
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
        }



    } catch (error) {

        console.log(error);
        return res.status(500).json({ error: 'Não foi possível realizar a busca' + error });
    }
}

export default corsPolicy(validateJWT(connectDatabase(search)));