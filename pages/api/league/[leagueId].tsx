// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import faunadb, { Collection, Ref } from "faunadb";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
};

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
              teams: q.Select(
                ["data"],
                q.Map(
                  q.Paginate(
                    q.Match(
                      q.Index("allTeamsStatsByGroups"),
                      q.Select(["ref"], q.Var("groupRef"))
                    )
                  ),
                  q.Lambda(
                    "teamStatRef",
                    q.Let(
                      {
                        tsRef: q.Get(q.Var("teamStatRef")),
                        team: q.Get(
                          q.Select(["data", "teamRef"], q.Var("tsRef"))
                        ),
                      },
                      {
                        name: q.Select(["data", "name"], q.Var("team")),
                        id: q.Select(["ref", "id"], q.Var("team")),
                        matches: q.Select(
                          ["data", "matches"],
                          q.Var("tsRef"),
                          0
                        ),
                        win: q.Select(["data", "win"], q.Var("tsRef"), 0),
                        loss: q.Select(["data", "loss"], q.Var("tsRef"), 0),
                        roundsWon: q.Select(
                          ["data", "roundsWon"],
                          q.Var("tsRef"),
                          0
                        ),
                        roundsLost: q.Select(
                          ["data", "roundsLost"],
                          q.Var("tsRef"),
                          0
                        ),
                        points: q.Select(["data", "points"], q.Var("tsRef"), 0),
                      }
                    )
                  )
                )
              ),
            })
          )
        ),
      }
    )
  );
  console.log(data.groups);

  return res.status(200).json(data);
};

const putHandler = async (req: NextApiRequest, res: NextApiResponse) => {};

export default async (req: NextApiRequest, res: NextApiResponse) => {
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
};
