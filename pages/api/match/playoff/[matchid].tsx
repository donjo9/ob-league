import { NextApiRequest, NextApiResponse } from "next";

import { authFaunaClient, client, q } from "../../../../utils/faunadb";

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
        matchRef: q.Get(q.Match(q.Index("getPlayoffMatchById"), matchid)),
        match: q.Select("data", q.Var("matchRef")),
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
            T2MAPWIN: q.Add(
              q.Select("T2MAPWIN", q.Var("acc")),
              q.If(
                q.LTE(
                  q.Select("team2Score", q.Var("value")),
                  q.Select("team1Score", q.Var("value"))
                ),
                0,
                1
              )
            ),
          }),
          { T1RW: 0, T2RW: 0, T1MAPWIN: 0, T2MAPWIN: 0 },
          q.Select("maps", q.Var("match"))
        ),
        T1WIN: q.If(
          q.Equals(2, q.Select("T1MAPWIN", q.Var("matchStats"))),
          true,
          false
        ),
        T2WIN: q.If(
          q.Equals(2, q.Select("T2MAPWIN", q.Var("matchStats"))),
          true,
          false
        ),
      },
      q.If(
        q.Equals(false, q.Select(["matchDone"], q.Var("match"), false)),
        q.Let(
          {
            nextMatchRef: q.Select(["nextMatchRef"], q.Var("match"), false),
          },
          q.Do(
            q.If(
              q.IsRef(q.Var("nextMatchRef")),
              q.Let(
                {
                  nextMatch: q.Get(q.Var("nextMatchRef")),
                  nextTeam1: q.IsRef(
                    q.Select(["data", "team1"], q.Var("nextMatch"), false)
                  ),
                  nextTeam2: q.IsRef(
                    q.Select(["data", "team2"], q.Var("nextMatch"), false)
                  ),
                },
                q.If(
                  q.Var("T1WIN"),
                  q.Do(
                    q.If(
                      q.ContainsPath(["team1"], q.Var("match")),
                      q.Do(
                        q.Update(q.Var("nextMatchRef"), {
                          data: q.If(
                            q.Var("nextTeam1"),
                            { team2: q.Select(["team1"], q.Var("match")) },
                            { team1: q.Select(["team1"], q.Var("match")) }
                          ),
                        })
                      ),
                      q.Abort("Missing team1")
                    )
                  ),
                  q.If(
                    q.Var("T2WIN"),
                    q.Do(
                      q.If(
                        q.ContainsPath(["team2"], q.Var("match")),
                        q.Do(
                          q.Update(q.Var("nextMatchRef"), {
                            data: q.If(
                              q.Var("nextTeam1"),
                              { team2: q.Select(["team2"], q.Var("match")) },
                              { team1: q.Select(["team2"], q.Var("match")) }
                            ),
                          })
                        ),
                        q.Abort("Missing team2")
                      )
                    ),
                    q.Abort("No winner")
                  )
                )
              ),
              {}
            ),
            q.Update(q.Select("ref", q.Var("matchRef")), {
              data: {
                matchDone: true,
              },
            }),
            {}
          )
        ),
        {}
      )
    )
  );
  console.log(result);

  return res.status(200).json({ result, matchid });
};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { matchid } = req.query;
  const match = await client.query(
    q.Let(
      { match: q.Get(q.Match(q.Index("getPlayoffMatchById"), matchid)) },
      {
        id: q.Select(["ref", "id"], q.Var("match")),
        team1: q.Let(
          {
            team: q.If(
              q.IsRef(
                q.Select(
                  ["data", "team1"],
                  q.Get(q.Select(["ref"], q.Var("match"))),
                  false
                )
              ),
              q.Get(
                q.Select(
                  ["data", "team1"],
                  q.Get(q.Select(["ref"], q.Var("match")))
                )
              ),
              false
            ),
          },
          {
            id: q.Select(["ref", "id"], q.Var("team"), 0),
            name: q.Select(["data", "name"], q.Var("team"), "TBD"),
          }
        ),
        team2: q.Let(
          {
            team: q.If(
              q.IsRef(
                q.Select(
                  ["data", "team2"],
                  q.Get(q.Select(["ref"], q.Var("match"))),
                  false
                )
              ),
              q.Get(
                q.Select(
                  ["data", "team2"],
                  q.Get(q.Select(["ref"], q.Var("match")))
                )
              ),
              false
            ),
          },
          {
            id: q.Select(["ref", "id"], q.Var("team"), 0),
            name: q.Select(["data", "name"], q.Var("team"), "TBD"),
          }
        ),
        maps: q.Select(["data", "maps"], q.Var("match")),
        date: q.Select(["data", "matchDate"], q.Var("match"), 0),
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
      q.Update(q.Ref(q.Collection("playOffMatches"), matchid), { data })
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
