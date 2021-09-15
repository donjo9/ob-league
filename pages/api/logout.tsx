import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import faunadb from "faunadb";
import { LoginData } from "../../types";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = await client.query(q.Logout(false));

    const cookie = new Cookies(req, res);

    cookie.set("loginToken", "", { httpOnly: true });
    return res.status(204).json({});
  } catch (error) {
    console.warn(error.message);
    return res.status(500).json({ error: error.message });
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
