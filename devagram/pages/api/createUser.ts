import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from '../../middlewares/connectDatabase'
import type { StandardResponse } from '../../types/StandardResponse';
import type { UserRequest } from '../../types/UserRequest';
import { UserModel } from '../../models/UserModel';
import md5 from 'md5';
import { upload, uploadImageCosmic } from '../../services/uploadImageCosmic';
import nc from 'next-connect';


const handler = nc()
    .use(upload.single('avatar'))
    .post(async (
        req: NextApiRequest,
        res: NextApiResponse<StandardResponse>
    ) => {

        try {
            const user = req.body as UserRequest;

            if (!user.name || user.name.length < 3) {
                return res.status(400).json({ error: 'Nome é obrigatório e precisa ter ao menos 3 caracteres.' });
            }

            if (!user.email || user.email.length < 5
                || !user.email.includes('@')
                || !user.email.includes('.')) {
                return res.status(400).json({ error: 'O email é obrigatório e precisa ter ao menos 6 caracteres e conter @ e .' });
            }

            if (!user.password || user.password.length < 6) {
                return res.status(400).json({ error: 'A senha é obrigatória e precisa ter ao menos 6 caracteres.' });
            }

            const userExist = await UserModel.findOne({ email: user.email })

            if (userExist) {
                return res.status(400).json({ error: 'Já existe um usuário cadastrado com esse email.' });
            }

            const image = await uploadImageCosmic(req);            

            const userToCreate = {
                name: user.name,
                email: user.email,
                password: md5(user.password),
                avatar: image?.media?.url
            }

            await UserModel.create(userToCreate);
            return res.status(200).json({ msg: 'Usuário criado com sucesso!' });

        } catch (error) {

            console.log(error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

export const config = {
    api: {
        bodyParser: false,
    }
}

export default connectDatabase(handler);
