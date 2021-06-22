// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import faunadb, { Collection, Ref } from "faunadb";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { teamId } = req.query;
  const data = await client.query<any>(
    q.Call("GetTeamAndPlayersByTeamId", teamId)
  );
  return res.status(200).json(data);
};

const putHandler = async (req: NextApiRequest, res: NextApiResponse) => {};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST":
        return postHandler(req, res);
      case "GET":
        return getHandler(req, res);
      case "PUT":
        return putHandler(req, res);
      default:
        break;
    }
  } catch (error) {
    console.warn(error.message);
    res.status(500).json(error.message);
  }
};
