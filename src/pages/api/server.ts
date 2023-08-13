import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>): Promise<void> => {
    const { ...params } = req.query;
    
    try {
        switch (req.method) {
            case 'GET':
                switch (params.query) {
                    case 'mode':
                        return res.status(200).send(process.env.SERVER_MODE);
                    default:
                        return res.status(400).send("Missing");
                }
            default:
                return res.status(400).send("Missing");
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        } else {
            return res.status(400).send(error);
        }
    }
}

export default handler;