import * as React from "react";
import { useQuery } from "react-query";
const useLeague = (paramLeagueId: string | string[] | undefined) => {
  const [leagueId, setLeagueId] = React.useState(paramLeagueId);

  React.useEffect(() => {
    setLeagueId(paramLeagueId);
  }, [paramLeagueId]);
  const { data, isLoading, isError } = useQuery(
    ["league", leagueId],
    async ({ queryKey }) => {
      const [_key, leagueId] = queryKey;

      const f = await fetch(`/api/league/${leagueId}`);
      if (!f.ok) {
        throw new Error("Network response was not ok");
      }
      return f.json();
    },
    {
      enabled: !!leagueId,
    }
  );
  return { setLeagueId, isError, isLoading, data: data || null };
};

export { useLeague };
