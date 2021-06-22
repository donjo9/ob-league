// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import faunadb from "faunadb";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name: leaguename } = req.body;
  if (leaguename) {
    const data = await client.query<any>(
      q.Let(
        {
          newLeague: q.Create(q.Collection("leagues"), {
            data: { name: leaguename },
          }),
        },
        {
          id: q.Select(["ref", "id"], q.Var("newLeague")),
          name: q.Select(["data", "name"], q.Var("newLeague")),
        }
      )
    );
    return res.status(200).json({ data });
  } else {
    return res.status(400).json({ message: "Missing league name" });
  }
};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { data } = await client.query<any>(
    q.Map(
      q.Paginate(q.Match(q.Index("getAllLeagues"))),
      q.Lambda(
        "l",
        q.Let(
          { league: q.Get(q.Var("l")) },
          {
            id: q.Select(["ref", "id"], q.Var("league")),
            name: q.Select(["data", "name"], q.Var("league")),
          }
        )
      )
    )
  );
  res.status(200).json(data);
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
