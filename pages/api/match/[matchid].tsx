import { NextApiRequest, NextApiResponse } from "next";
import faunadb from "faunadb";
import authFaunaClient from "../../../utils/authFaunaClient";
const secret = process.env.FAUNADB_SECRET || "";

const q = faunadb.query;
const client = new faunadb.Client({ secret });

type FaunaDBRef = {
  id: string;
};
type MapsData = {
  team1Score: number;
  team2Score: number;
  map: string;
};

type MatchData = {
  groupRef: FaunaDBRef;
  team1: FaunaDBRef;
  team2: FaunaDBRef;
  maps: Array<MapsData>;
};

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { matchid } = req.query;

  const result = await client.query(
    q.Let(
      {
        matchRef: q.Get(q.Match(q.Index("getMatchById"), matchid)),
        match: q.Select("data", q.Var("matchRef")),
        team1Stats: q.Get(
          q.Match(
            q.Index("getGroupTeamStatsByGroupAndTeamId"),
            q.Select(["groupRef", "id"], q.Var("match")),
            q.Select(["team1", "id"], q.Var("match"))
          )
        ),
        team2Stats: q.Get(
          q.Match(
            q.Index("getGroupTeamStatsByGroupAndTeamId"),
            q.Select(["groupRef", "id"], q.Var("match")),
            q.Select(["team2", "id"], q.Var("match"))
          )
        ),
        matchStats: q.Reduce(
          q.Lambda(["acc", "value"], {
            T1RW: q.Add(
              q.Select("T1RW", q.Var("acc")),
              q.Select("team1Score", q.Var("value"))
            ),
            T2RW: q.Add(
              q.Select("T2RW", q.Var("acc")),
              q.Select("team2Score", q.Var("value"))
            ),
            T1MAPWIN: q.Add(
              q.Select("T1MAPWIN", q.Var("acc")),
              q.If(
                q.LTE(
                  q.Select("team1Score", q.Var("value")),
                  q.Select("team2Score", q.Var("value"))
                ),
                0,
                1
              )
            ),
          }),
          { T1RW: 0, T2RW: 0, T1MAPWIN: 0 },
          q.Select("maps", q.Var("match"))
        ),
        T1WIN: q.If(
          q.Equals(2, q.Select("T1MAPWIN", q.Var("matchStats"))),
          1,
          0
        ),
        T2WIN: q.If(
          q.Equals(2, q.Select("T1MAPWIN", q.Var("matchStats"))),
          0,
          1
        ),
      },
      q.If(
        q.Equals(false, q.Select(["matchDone"], q.Var("match"), false)),
        q.Do(
          q.Update(q.Select("ref", q.Var("team1Stats")), {
            data: {
              matches: q.Add(
                1,
                q.Select(["data", "matches"], q.Var("team1Stats"))
              ),
              win: q.Add(
                q.Var("T1WIN"),
                q.Select(["data", "win"], q.Var("team1Stats"))
              ),
              loss: q.Add(
                q.Var("T2WIN"),
                q.Select(["data", "loss"], q.Var("team1Stats"))
              ),
              roundsWon: q.Add(
                q.Select("T1RW", q.Var("matchStats")),
                q.Select(["data", "roundsWon"], q.Var("team1Stats"))
              ),
              roundsLost: q.Add(
                q.Select("T2RW", q.Var("matchStats")),
                q.Select(["data", "roundsLost"], q.Var("team1Stats"))
              ),
              points: q.Add(
                q.Multiply(3, q.Var("T1WIN")),
                q.Select(["data", "points"], q.Var("team1Stats"))
              ),
            },
          }),
          q.Update(q.Select("ref", q.Var("team2Stats")), {
            data: {
              matches: q.Add(
                1,
                q.Select(["data", "matches"], q.Var("team2Stats"))
              ),
              win: q.Add(
                q.Var("T2WIN"),
                q.Select(["data", "win"], q.Var("team2Stats"))
              ),
              loss: q.Add(
                q.Var("T1WIN"),
                q.Select(["data", "loss"], q.Var("team2Stats"))
              ),
              roundsWon: q.Add(
                q.Select("T2RW", q.Var("matchStats")),
                q.Select(["data", "roundsWon"], q.Var("team2Stats"))
              ),
              roundsLost: q.Add(
                q.Select("T1RW", q.Var("matchStats")),
                q.Select(["data", "roundsLost"], q.Var("team2Stats"))
              ),
              points: q.Add(
                q.Multiply(3, q.Var("T2WIN")),
                q.Select(["data", "points"], q.Var("team2Stats"))
              ),
            },
          }),
          q.Update(q.Select("ref", q.Var("matchRef")), {
            data: {
              matchDone: true,
            },
          }),
          {}
        ),
        {}
      )
    )
  );

  return res.status(200).json({ result, matchid });
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
        matchDone: q.Select(["data", "matchDone"], q.Var("match"), false),
      }
    )
  );
  return res.status(200).json(match);
};
const putHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { matchid } = req.query;
  const { data } = req.body;
  const client = authFaunaClient(req, res);
  const match = await client.query(
    q.Select(
      "data",
      q.Update(q.Ref(q.Collection("groupMatches"), matchid), { data })
    )
  );
  return res.status(200).json(match);
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
