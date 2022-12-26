import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const { method } = req;
    
    if (method === "GET") {
        return res.status(200).json({})
    }
}
  