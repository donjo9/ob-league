import { NextApiRequest, NextApiResponse } from "next";
import faunadb from "faunadb";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { matchid } = req.query;
  const match = await client.query(
    q.Let(
      { match: q.Get(q.Match(q.Index("getMatchById"), matchid)) },
      {
        id: q.Select(["ref", "id"], q.Var("match")),
        team1: q.Let(
          {
            team: q.Get(
              q.Select(
                ["data", "team1"],
                q.Get(q.Select(["ref"], q.Var("match")))
              )
            ),
          },
          {
            id: q.Select(["ref", "id"], q.Var("team")),
            name: q.Select(["data", "name"], q.Var("team")),
          }
        ),
        team2: q.Let(
          {
            team: q.Get(
              q.Select(
                ["data", "team2"],
                q.Get(q.Select(["ref"], q.Var("match")))
              )
            ),
          },
          {
            id: q.Select(["ref", "id"], q.Var("team")),
            name: q.Select(["data", "name"], q.Var("team")),
          }
        ),
        maps: q.Select(["data", "maps"], q.Var("match")),
        date: q.Select(["data", "matchDate"], q.Var("match")),
      }
    )
  );
  return res.status(200).json(match);
};
const putHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
};

const deleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
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
  } catch (error) {
    console.warn(error.message);
    res.status(500).json(error.message);
  }
};
