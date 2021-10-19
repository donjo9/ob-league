// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { client, q } from "../../../utils/faunadb";

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("req.body: ", req.body);

  const { id, name } = req.body;
  console.log("id: ", id, "name: ", name);
  const r = await client.query<any>(
    q.Create(q.Ref(q.Collection("teams"), id), { data: { name } })
  );
  return res.status(200).json(r);
};

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
  res.status(200).json(data);
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
