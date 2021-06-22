// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import faunadb, { Collection, Ref } from "faunadb";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { data } = await client.query<any>(
    q.Map(
      q.Paginate(q.Match(q.Index("getAllTeams"))),
      q.Lambda(
        "team",
        q.Let(
          {
            teamDoc: q.Get(q.Var("team")),
          },
          {
            id: q.Select(["ref", "id"], q.Var("teamDoc")),
            name: q.Select(["data", "name"], q.Var("teamDoc")),
          }
        )
      )
    )
  );

  console.log(data);
  res.status(200).json(data);
};

const putHandler = async (req: NextApiRequest, res: NextApiResponse) => {};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST":
        postHandler(req, res);
        break;
      case "GET":
        getHandler(req, res);
        break;
      case "PUT":
        putHandler(req, res);
        break;
      default:
        break;
    }
  } catch (error) {
    console.warn(error.message);
    res.status(500).json(error.message);
  }
};
