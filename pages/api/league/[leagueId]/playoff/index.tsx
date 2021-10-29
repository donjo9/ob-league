import type { NextApiRequest, NextApiResponse } from "next";
import { client, q } from "../../../../../utils/faunadb";

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { leagueId } = req.query;
  console.log(leagueId);

  const playoff = await client.query(
    q.Select(
      ["data"],
      q.Map(
        q.Paginate(
          q.Match(
            q.Index("getPlayoffMatchesByLeague"),
            q.Ref(q.Collection("leagues"), leagueId)
          )
        ),
        q.Lambda(
          "m",
          q.Let(
            {
              match: q.Get(q.Var("m")),
            },
            {
              id: q.Select(["ref", "id"], q.Var("match")),
              maps: q.Select(["data", "maps"], q.Var("match")),
              type: q.Select(["data", "type"], q.Var("match")),
              nextMatchId: q.If(
                q.IsRef(
                  q.Select(["data", "nextMatchRef"], q.Var("match"), false)
                ),
                q.Select(
                  ["ref", "id"],
                  q.Get(q.Select(["data", "nextMatchRef"], q.Var("match")))
                ),
                null
              ),
              team1: q.If(
                q.IsRef(q.Select(["data", "team1"], q.Var("match"), false)),
                q.Select(
                  ["data"],
                  q.Get(q.Select(["data", "team1"], q.Var("match")))
                ),
                {
                  name: "TBD",
                }
              ),
              team2: q.If(
                q.IsRef(q.Select(["data", "team2"], q.Var("match"), false)),
                q.Select(
                  ["data"],
                  q.Get(q.Select(["data", "team2"], q.Var("match")))
                ),
                {
                  name: "TBD",
                }
              ),
              date: q.Select(["data", "matchDate"], q.Var("match"), 0),
              matchDone: q.Select(["data", "matchDone"], q.Var("match"), false),
            }
          )
        )
      )
    )
  );
  return res.status(200).json(playoff);
};

const putHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(405).json({});
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
