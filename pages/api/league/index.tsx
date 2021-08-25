// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import faunadb, { Create } from "faunadb";

const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.body);
  const { name: leaguename, teams } = req.body;
  if (leaguename) {
    const league = await client.query<any>(
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
    if (Array.isArray(teams) && teams.length > 0) {
      const group = await client.query<any>(
        q.Let(
          {
            newGroup: q.Create(q.Collection("groups"), {
              data: {
                leagueRef: q.Ref(q.Collection("leagues"), league.id),
                teams: q.Map(
                  teams.map((t) => t.id),
                  q.Lambda("team", q.Ref(q.Collection("teams"), q.Var("team")))
                ),
              },
            }),
          },
          {
            group: q.Var("newGroup"),
            groupStats: q.Map(
              q.Select(["data", "teams"], q.Var("newGroup")),
              q.Lambda(
                "groupTeam",
                q.Create(q.Collection("groupTeamStats"), {
                  data: {
                    groupRef: q.Select(["ref"], q.Var("newGroup")),
                    teamRef: q.Var("groupTeam"),
                    matches: 0,
                    win: 0,
                    loss: 0,
                    roundsWon: 0,
                    roundsLost: 0,
                    points: 0,
                  },
                })
              )
            ),
          }
        )
      );
      console.log(group);
    }

    return res.status(200).json({ data: league });
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
