import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import faunadb from "faunadb";
import { LoginData } from "../../types";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new Error("Missing email");
    }

    if (!password) {
      throw new Error("Password cannot be empty");
    }

    const user = await client.query<LoginData>(
      q.Let(
        {
          login: q.Login(q.Match(q.Index("unique_User_email"), email), {
            password: password,
          }),
        },
        {
          id: q.Select(["ref", "id"], q.Var("login")),
          secret: q.Select("secret", q.Var("login")),
          data: q.Select("data", q.Get(q.Select("instance", q.Var("login")))),
        }
      )
    );

    const cookie = new Cookies(req, res);

    cookie.set("loginToken", user.secret, { httpOnly: true });

    return res.status(200).json({ ...user.data, id: user.id });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
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
