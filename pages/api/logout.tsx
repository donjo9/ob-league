import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import { client, q } from "../../utils/faunadb";

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = await client.query(q.Logout(false));

    const cookie = new Cookies(req, res);

    cookie.set("loginToken", "", { httpOnly: true });
    return res.status(204).json({});
  } catch (error) {
    console.warn((error as Error).message);
    return res.status(500).json({ error: (error as Error).message });
  }
};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
};

const putHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
};

const deleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      return postHandler(req, res);
    case "GET":
      return getHandler(req, res);
    case "PUT":
      return putHandler(req, res);
    case "DELETE":
      return deleteHandler(req, res);
    default:
      return res.status(405).json({});
  }
};
