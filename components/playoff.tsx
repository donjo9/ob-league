import * as React from "react";
import { useQuery } from "react-query";
import PlayoffMatch from "./playoffMatch";

interface Props {
  leagueId: String | string[] | undefined;
}

type MapInfo = {
  map: string;
  team1Score: number;
  team2Score: number;
};

export type PlayoffMatchData = {
  id: string;
  maps: Array<MapInfo>;
  type: number;
  nextMatchId: string | null;
  team1: {
    name: string;
  };
  team2: {
    name: string;
  };
  date: number;
  matchDone: boolean;
};

const Playoff: React.FC<Props> = ({ leagueId }) => {
  const {
    data: playOffData,
    isLoading: isPlayoffLoading,
    isError: isPlayoffError,
  } = useQuery<Array<PlayoffMatchData>>(
    ["playoff", leagueId],
    async ({ queryKey }) => {
      console.log(queryKey);

      const [_key, leagueId] = queryKey;

      const f = await fetch(`/api/league/${leagueId}/playoff`);
      if (!f.ok) {
        throw new Error("Network response was not ok");
      }

      return f.json();
    },
    {
      enabled: !!leagueId,
    }
  );

  let types = new Set();
  let matches = new Map();
  let nextmatch = new Map();
  let first = [];
  let order = Array<Array<string>>();
  if (playOffData) {
    for (let i = 0; i < playOffData?.length; i++) {
      let { type, id, nextMatchId } = playOffData[i];
      types.add(type);
      matches.set(id, playOffData[i]);
      if (nextMatchId) {
        if (nextmatch.has(nextMatchId)) {
          const t = nextmatch.get(nextMatchId);
          t.push(id);
          nextmatch.set(nextMatchId, t);
        } else {
          nextmatch.set(nextMatchId, [id]);
        }
      }
      if (type == 1) {
        first.push(id);
      }
    }
  }

  const makeOrder = (next: Array<string>, order: Array<Array<string>>) => {
    for (let i = 0; i < next.length; i++) {
      const { id, type } = matches.get(next[i]);
      if (order.length >= type) {
        order[type - 1].push(id);
      } else {
        order.push([id]);
      }
      if (nextmatch.has(id)) {
        makeOrder(nextmatch.get(id), order);
      }
    }
  };

  makeOrder(first, order);

  const matchTypes = ["Finale", "Semifinale", "Kvartfinale"];
  let matchesComponents = [];
  for (let i = 0; i < order.length; i++) {
    let typeComponents = [];
    for (let j = 0; j < order[i].length; j++) {
      typeComponents.push(
        <PlayoffMatch {...matches.get(order[i][j])} key={order[i][j]} />
      );
    }
    matchesComponents.push(
      <div className="flex flex-col justify-center" key={i + 1}>
        <h1 className="bg-gray-900 text-center px-2 py-1">{matchTypes[i]}</h1>
        {typeComponents}
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse justify-evenly bg-gray-700 my-2">
      {matchesComponents}
    </div>
  );
};

export default Playoff;
