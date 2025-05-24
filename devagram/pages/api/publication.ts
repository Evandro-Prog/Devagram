import type { NextApiResponse } from 'next';
import nc from 'next-connect';
import type { StandardResponse } from '../../types/StandardResponse';
import { upload, uploadImageCosmic } from '../../services/uploadImageCosmic';
import { connectDatabase } from '../../middlewares/connectDatabase';
import { validateJWT } from '../../middlewares/validateJWT';
import { PublicationModel } from '../../models/PublicationModel';
import { UserModel } from '../../models/UserModel';


const handler = nc()
    .use(upload.single('file'))
    .post(async (
        req: any,
        res: NextApiResponse<StandardResponse>
    ) => {

        try {

            const { userId } = req.query;
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(400).json({ error: 'Usuário não encontrado!' });
            }

            if (!req || !req.body) {
                return res.status(400).json({ error: 'Parâmetros de entrada inválidos!' });
            }

            const { description } = req.body;
            if (!description || description.length < 2) {
                return res.status(400).json({ error: 'Descrição precisa ter ao menos 2 caracteres.' });
            }

            if (!req.file || !req.file.originalname) {
                return res.status(400).json({ error: 'Imagem é obrigatória.' });
            }

            const image = await uploadImageCosmic(req);
            const publication = {
                idUser: user._id,
                description,
                image: image.media.url,
                date: new Date()
            }

            user.publications++;
            await UserModel.findByIdAndUpdate({ _id: user._id }, user);

            await PublicationModel.create(publication);
            return res.status(200).json({ msg: 'Publicação criada com sucesso!' });

        } catch (error) {
            console.log(error);

            return res.status(400).json({ error: 'Erro ao criar publicação!' });

        }
    })

export const config = {
    api: {
        bodyParser: false,
    },
}

export default validateJWT(connectDatabase(handler));