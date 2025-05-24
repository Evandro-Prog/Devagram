import type { NextApiRequest, NextApiResponse } from 'next';
import type { StandardResponse } from '../../types/StandardResponse';
import { connectDatabase } from '../../middlewares/connectDatabase';
import { validateJWT } from '../../middlewares/validateJWT';
import { UserModel } from '../../models/UserModel';
import { FollowModel } from '../../models/FollowModel';
import { corsPolicy } from '../../middlewares/corsPolicy';



const follow = async (
    req: NextApiRequest,
    res: NextApiResponse<StandardResponse>
) => {
    try {
        if (req.method === 'PUT') {

            const { userId, id } = req?.query;
            const loggedUser = await UserModel.findById(userId);

            if (!loggedUser) {
                return res.status(400).json({ error: 'Usuário logado não encontrado!' });
            }

            const userToFollow = await UserModel.findById(id);
            if (!userToFollow) {
                return res.status(400).json({ error: 'Usuário a ser seguido não encontrado!' });

            }

            const alreadyFollowing = await FollowModel.find({
                userId: loggedUser._id,
                userFollowedId: userToFollow._id
            });

            if (alreadyFollowing && alreadyFollowing.length > 0) {

                alreadyFollowing.forEach(async (e: any) => await FollowModel.findByIdAndDelete({ _id: e._id }));

                loggedUser.following--;
                await UserModel.findByIdAndUpdate({ _id: loggedUser._id }, loggedUser);

                userToFollow.followers--;
                await UserModel.findByIdAndUpdate({ _id: userToFollow._id }, userToFollow);

                return res.status(200).json({ msg: 'Usuário dexado de seguir com sucesso!' });

            } else {
                const follower = {
                    userId: loggedUser._id,
                    userFollowedId: userToFollow._id
                };
                await FollowModel.create(follower);

                loggedUser.following++
                await UserModel.findByIdAndUpdate({ _id: loggedUser._id }, loggedUser);

                userToFollow.followers++;
                await UserModel.findByIdAndUpdate({ _id: userToFollow._id }, userToFollow);

                return res.status(200).json({ msg: 'Usuário seguido com sucesso!' });
            }

        }
        return res.status(405).json({ error: 'Método não permitido!' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Não foi possível seguir/ deixar de seguir o usuário!' + error });
    }
}

export default corsPolicy(validateJWT(connectDatabase(follow)));