import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import nc from 'next-connect';
import { validateJWT } from '../../middlewares/validateJWT';
import { connectDatabase } from '../../middlewares/connectDatabase';
import type { StandardResponse } from '../../types/StandardResponse';
import { upload, uploadImageCosmic } from '../../services/uploadImageCosmic';
import { UserModel } from '../../models/UserModel';


const handler = nc()
    .use(upload.single('file'))
    
    .put(async (req: any, res: NextApiResponse<StandardResponse> | any) => {

        try {

            const { userId } = req?.query;
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(400).json({ error: 'Usuário não encontrado!' });
            }

            const { name } = req.body;

            if (name && name.length > 2) {
                user.name = name;
            }

            console.log('user', user);

            const { file } = req;
            if (file && file.originalname) {

                const image = await uploadImageCosmic(req);
                if (image && image.media && image.media.url) {
                    user.avatar = image.media.url;
                }
            }

            await UserModel.findByIdAndUpdate({ _id: user._id }, user);

            return res.status(200).json({ msg: 'Usuário atualizado com sucesso!' });

        } catch (error) {

            console.log(error);
            return res.status(400).json({ error: 'Não foi possível atualizar dados do usuário:' + error });
        }
    })

    .get(async (
        req: NextApiRequest,
        res: NextApiResponse<StandardResponse | any>
    ) => {

        try {

            const { userId } = req?.query;
            const user = await UserModel.findById(userId);
            user.password = null;
            return res.status(200).json({ user });

        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Não foi possível obter dados do usúario' });

        }
    });

export const config = {
    api: {
        bodyParser: false,
    },
}


export default validateJWT(connectDatabase(handler));