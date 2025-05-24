import type { NextApiRequest, NextApiResponse } from 'next';
import type { StandardResponse } from '../../types/StandardResponse';
import { PublicationModel } from '../../models/PublicationModel';
import { UserModel } from '../../models/UserModel';
import { validateJWT } from '../../middlewares/validateJWT';
import { connectDatabase } from '../../middlewares/connectDatabase';
import { corsPolicy } from '../../middlewares/corsPolicy';

const comment = async (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse>) => {

    try {

        if (req.method === 'PUT') {

            const { userId, id } = req.query;
            const loggedUser = await UserModel.findById(userId)
            if (!loggedUser) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const publication = await PublicationModel.findById(id);
            if (!publication) {
                return res.status(404).json({ error: 'Publicação não encontrada' });
            }

            if (!req.body || !req.body.comments || req.body.comments.length < 1) {
                return res.status(400).json({ error: 'Comentário inválido' });
            }
            const comment = {
                idUser: loggedUser._id,
                name: loggedUser.name,
                comments: req.body.comments
            }

            publication.comments.push(comment);            
            await PublicationModel.findByIdAndUpdate(publication._id, { $push: { comments: comment } }
            );
            return res.status(200).json({ msg: 'Comentário adicionado com sucesso' });

        }
        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export default corsPolicy(validateJWT(connectDatabase(comment)));
