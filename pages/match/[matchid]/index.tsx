import { useRouter } from "next/router";
import * as React from "react";
import { useQuery } from "react-query";
import Link from "next/link";
import { matchInfoType } from "../../../types";
import { useAuth } from "../../../utils/useAuth";
import styled from "styled-components";
import tw from "twin.macro";

const EditButton = styled.a`
  ${tw`bg-green-500 rounded-md px-4 py-2 m-1 inline-block cursor-pointer`}
`;

const MatchHeader = styled.div`
  ${tw`m-2 w-1/4 grid grid-cols-3 border-2 bg-gray-700 border-gray-900 `}
`;

const MatchHeaderTime = styled.div`
  ${tw`text-center p-2 m-auto`}
`;

const MatchMapContainer = styled.div`
  ${tw`grid grid-cols-4 w-1/4 bg-gray-900 m-2`}
`;

const Team1Item = styled.div`
  ${tw`text-left p-2`}
`;

const Team2Item = styled.div`
  ${tw`text-right p-2`}
`;

type MatchMapProps = {
  map: string;
};

const MatchMap = styled.div<MatchMapProps>`
  ${tw`col-span-4 text-center backdrop-blur-md`}
  ${(props) => {
    console.log(props.map);

    switch (props.map) {
      case "Nuke":
        return tw`bg-red-900`;
      case "Inferno":
        return tw`bg-blue-900`;
      case "Overpass":
        return tw`bg-yellow-600 text-black`;
      case "Ancient":
        return tw`bg-green-900`;
      case "Mirage":
        return tw`bg-purple-900`;
      case "Dust2":
        return tw`bg-yellow-300 text-black`;
      case "Vertigo":
        return tw`bg-blue-200 text-black`;
      default:
        return tw`bg-gray-600`;
    }
  }}
`;

const matchInfo = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { matchid } = router.query;
  const {
    data: matchData,
    isLoading: isMatchLoading,
    isError: isMatchError,
  } = useQuery<matchInfoType>(
    ["match", matchid],
    async ({ queryKey }) => {
      console.log(queryKey);

      const [_key, matchid] = queryKey;

      const f = await fetch(`/api/match/${matchid}`);
      if (!f.ok) {
        throw new Error("Network response was not ok");
      }
      return f.json();
    },
    {
      enabled: !!matchid,
    }
  );
  if (isMatchLoading || !matchData) {
    return <div>Loading...</div>;
  }
  const date = new Date(matchData.date);
  return (
    <div>
      <MatchHeader>
        <Team1Item>{matchData.team1.name}</Team1Item>{" "}
        <MatchHeaderTime>
          {matchData.matchDone
            ? "Ended"
            : date.toLocaleDateString() + " - " + date.toLocaleTimeString()}
        </MatchHeaderTime>
        <Team2Item> {matchData?.team2?.name}</Team2Item>
      </MatchHeader>
      <div>
        {matchData?.maps.map((map, index) => {
          return (
            <MatchMapContainer key={index}>
              <MatchMap map={map.map}>
                {map.map !== "" ? map.map : "TBA"}
              </MatchMap>
              <Team1Item>{matchData.team1.name}</Team1Item>
              <Team1Item>
                {map.team1Score == map.team2Score ? "-" : map.team1Score}
              </Team1Item>
              <Team2Item>
                {map.team1Score == map.team2Score ? "-" : map.team2Score}
              </Team2Item>
              <Team2Item>{matchData.team2.name}</Team2Item>
            </MatchMapContainer>
          );
        })}
        {user.email && matchData.matchDone == false && (
          <Link href={`/match/${matchid}/edit`}>
            <EditButton>Edit</EditButton>
          </Link>
        )}
      </div>
    </div>
  );
};

export default matchInfo;
