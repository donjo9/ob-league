import * as React from "react";
import styled from "styled-components";
import tw from "twin.macro";
import Link from "next/link";
import { PlayoffMatchData } from "./playoff";

const MatchContainer = styled.div`
  ${tw`m-1 grid grid-cols-2 border-b border-gray-700 cursor-pointer hover:border-blue-200 hover:bg-gray-600 cursor-pointer`}
`;

const PlayoffMatch: React.FC<PlayoffMatchData> = (props) => {
  const { id, team1, team2, date, maps } = props;

  const time = new Date(date);
  return (
    <React.Fragment>
      <h1 className="bg-gray-600 px-2 py-1">
        {time.toLocaleDateString()} - {time.toLocaleTimeString()}
        <br />
        {/* id */}
      </h1>
      <Link href={`/match/playoff/${id}`}>
        <MatchContainer>
          <div className="px-2">{team1.name} </div>
          <div className="px-2 text-right">
            {props.maps.reduce(
              (acc, map) => acc + (map.team1Score > map.team2Score ? 1 : 0),
              0
            )}
          </div>
          <div className="px-2">{team2.name}</div>
          <div className="px-2 text-right">
            {props.maps.reduce(
              (acc, map) => acc + (map.team2Score > map.team1Score ? 1 : 0),
              0
            )}
          </div>
        </MatchContainer>
      </Link>
    </React.Fragment>
  );
};

export default PlayoffMatch;
