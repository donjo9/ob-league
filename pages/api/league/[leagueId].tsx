// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import faunadb, { Collection, Ref } from "faunadb";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { leagueId } = req.query;
  const data = await client.query<any>(
    q.Let(
      {
        league: Ref(Collection("leagues"), leagueId),
        groups: q.Map(
          q.Paginate(q.Match(q.Index("allGroupsByLeague"), q.Var("league"))),
          q.Lambda("groupRef", q.Get(q.Var("groupRef")))
        ),
      },
      {
        name: q.Select(["data", "name"], q.Get(q.Var("league"))),
        groups: q.Select(
          ["data"],
          q.Map(
            q.Var("groups"),
            q.Lambda("groupRef", {
              id: q.Select(["ref", "id"], q.Var("groupRef")),
              teams: q.Map(
                q.Select(["data", "teams"], q.Var("groupRef")),
                q.Lambda("teamRef", {
                  name: q.Select(["data", "name"], q.Get(q.Var("teamRef"))),
                  id: q.Select(["ref", "id"], q.Get(q.Var("teamRef"))),
                })
              ),
            })
          )
        ),
      }
    )
  );
  console.log(data);

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
