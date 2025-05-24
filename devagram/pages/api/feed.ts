import type { NextApiRequest, NextApiResponse } from 'next';
import { validateJWT } from '../../middlewares/validateJWT';
import { connectDatabase } from '../../middlewares/connectDatabase';
import type { StandardResponse } from '../../types/StandardResponse';
import { UserModel } from '../../models/UserModel';
import { PublicationModel } from '../../models/PublicationModel';
import { FollowModel } from '../../models/FollowModel';

const feed = async (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse | any[]>) => {
    try {
        if (req.method === 'GET') {

            // Verifica se o id do usuário foi passado na query
            if (req?.query?.id) {

                //Pega o id do usuario no banco de dados
                const user = await UserModel.findById(req?.query?.id);
                if (!user) {
                    return res.status(400).json({ error: 'Usuário não encontrado!' });
                }
                //Checa na tabela de publicações se existe alguma publicação do usuário
                const publications = await PublicationModel.find({ idUser: user._id })
                    //ordena as publicações pela data                    
                    .sort({ date: -1 });

                // Retorna as publicações
                return res.status(200).json(publications);

            } else {

                const { userId } = req.query;
                const loggedUser = await UserModel.findById(userId);
                if (!loggedUser) {
                    return res.status(400).json({ error: 'Usuário não encontrado!' });
                }

                const following = await FollowModel.find({ userId: loggedUser._id });
                const followingIds = following.map(s => s.userFollowedId);
                const publications = await PublicationModel.find({
                    $or: [
                        { idUser: loggedUser._id },
                        { idUser: followingIds }
                    ]
                }).sort({ date: -1 });

                const result = [];
                for (const publication of publications) {
                    const userPublication = await UserModel.findById(publication.idUser)
                    if (userPublication) {
                        const finalPublication = {
                            ...publication._doc, user: {
                                name: userPublication.name,
                                avatar: userPublication.avatar
                            }
                        };
                        result.push(finalPublication);
                    }
                }

                return res.status(200).json(result);
            }
        }

        return res.status(405).json({ error: 'Método não permitido.' });

    } catch (error) {

        console.log(error);
        return res.status(400).json({ error: 'Não foi possível obter feed de noticias.' });
    }
}


export default validateJWT(connectDatabase(feed));