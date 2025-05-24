import type { NextApiRequest, NextApiResponse } from 'next';
import type { StandardResponse } from '../../types/StandardResponse';
import { connectDatabase } from '../../middlewares/connectDatabase';
import { validateJWT } from '../../middlewares/validateJWT';
import { PublicationModel } from '../../models/PublicationModel';
import { UserModel } from '../../models/UserModel';

const like = async (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse>
) => {
    try {

        if (req.method === 'PUT') {
            const { id } = req?.query;
            const publication = await PublicationModel.findById(id);
            if (!publication) {

                return res.status(400).json({ error: 'Publicação não encontrada!' });
            }

            const { userId } = req?.query;
            const user = await UserModel.findById(userId);
            if (!user) {

                return res.status(400).json({ error: 'Usuário não encontrado!' });
            }

            const userLikedIndex = publication.likes.findIndex((e: any) => e.toString() === user._id.toString());
            if (userLikedIndex != -1) {
                publication.likes.splice(userLikedIndex, 1);
                await PublicationModel.findByIdAndUpdate({ _id: publication._id }, publication);
                return res.status(200).json({ msg: 'Publicação descurtida com sucesso!' });

            } else {

                publication.likes.push(user._id);
                await PublicationModel.findByIdAndUpdate({ _id: publication._id }, publication);
                return res.status(200).json({ msg: 'Publicação curtida com sucesso!' });
            }
        }

        res.status(405).json({ error: 'Método não permitido.' });


    } catch (error) {

        console.log(error);
        return res.status(500).json({ error: 'Não foi possível curtir/ descurtir a publicação!' + error });

    }
}

export default validateJWT(connectDatabase(like));