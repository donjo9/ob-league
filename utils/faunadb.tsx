import faunadb from "faunadb";
import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";

const secret = process.env.FAUNADB_SECRET || "";
const domain = process.env.FAUNA_DOMAIN || "db.fauna.com";
const scheme = process.env.FAUNA_SCHEME == "http" ? "http" : "https";
const port = Number(process.env.FAUNA_PORT) || 443;

export function authFaunaClient(req: NextApiRequest, res: NextApiResponse) {
  const cookie = new Cookies(req, res);
  let token = cookie.get("loginToken") || "";

  return new faunadb.Client({
    secret: token,
    domain,
    scheme,
    port,
  });
}

export const q = faunadb.query;
export const client = new faunadb.Client({ secret, domain, scheme, port });
