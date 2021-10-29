import { useRouter } from "next/router";
import * as React from "react";
import { useLeague } from "../../../hooks/UseLeague";

const LeagueAdmin = () => {
  const router = useRouter();
  const { leagueId } = router.query;
  const { isLoading, isError, data } = useLeague(leagueId);
  return <div></div>;
};

export default LeagueAdmin;
