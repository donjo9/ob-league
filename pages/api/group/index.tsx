// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import faunadb, { Collection } from "faunadb";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { lid: leagueId } = req.body;

  if (leagueId) {
    const data = await client.query<any>(
      q.Let(
        {
          newGroup: q.Create(q.Collection("groups"), {
            data: {
              leagueRef: q.Ref(q.Collection("leagues"), leagueId),
              teams: [],
            },
          }),
        },
        {
          id: q.Select(["ref", "id"], q.Var("newGroup")),
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
      q.Paginate(q.Match(q.Index("getAllGroups"))),
      q.Lambda(
        "g",
        q.Let(
          { group: q.Get(q.Var("g")) },
          {
            id: q.Select(["ref", "id"], q.Var("group")),
            leagueRef: q.Select(["data", "leagueRef"], q.Var("group")),
          }
        )
      )
    )
  );
  console.log(data);
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
