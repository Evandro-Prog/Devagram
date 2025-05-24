import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import type { StandardResponse } from '../types/StandardResponse';
import NextCors from 'nextjs-cors';
import { headers } from 'next/headers';

export const corsPolicy = (handler: NextApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse<StandardResponse>) => {

        try {

            await NextCors(req, res, {
                origin: '*',
                methods: ['GET', 'POST', 'PUT'],
                optionSuccessStatus: 200,
            });

            return handler(req, res);

        } catch (error) {
            console.error('CORS policy error:', error);
            res.status(500).json({ error: 'Internal Server Error.' });
        }
    } 