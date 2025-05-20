import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next'
import mongoose from 'mongoose'
import type {StandardResponse} from '../types/StandardResponse';

export const connectDatabase = (handler: NextApiHandler) =>  async (
    req: NextApiRequest,
    res: NextApiResponse<|StandardResponse>
) => {
    //verifica se a conexão já existe, se existir seguir para o endpoint ou proximo middleware
    if(mongoose.connection.readyState === 1) {
        return handler(req, res)
    }

    //se não estiver conectado, tenta conectar ao banco de dados
    //obter variavel de ambiente preenchida do .env
    const {DB_CONNECTION_STRING} = process.env;

    //se a env não estiver preenchida, retorna erro e não conecta
    if(!DB_CONNECTION_STRING) {
        return res.status(500).json({error: 'Database connection string not found'});
    }

    mongoose.connection.on('connected', () => console.log('MongoDB connected'));
    mongoose.connection.on('error', error => console.log('MongoDB connection error:', error));
    await mongoose.connect(DB_CONNECTION_STRING);

    return handler(req, res);
}