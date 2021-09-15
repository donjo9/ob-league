import faunadb from "faunadb";
import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";
export default function authFaunaClient(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookie = new Cookies(req, res);
  let token = cookie.get("loginToken");
  return new faunadb.Client({
    secret: token,
  });
}
