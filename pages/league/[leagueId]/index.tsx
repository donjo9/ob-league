import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { useLeague } from "../../../hooks/UseLeague";
import { useQuery } from "react-query";

const Container = styled.div`
  ${tw`bg-gray-800 text-blue-100 md:flex justify-center`}
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const Content = styled.main`
  ${tw`m-2 p-2 md:w-3/4 lg:w-1/2 xl:w-1/3`}
`;

const GroupTable = styled.table`
  ${tw`bg-gray-700 p-2 table-auto w-full text-center`}
`;

const GroupHead = styled.thead`
  ${tw`bg-gray-900 m-2`}
`;
type TeamType = {
  name: string;
  id: string;
  matches: number;
  win: number;
  loss: number;
  roundsWon: number;
  roundsLost: number;
  points: number;
};
type groupType = {
  id: string;
  teams: Array<TeamType>;
};

type leagueType = {
  name: string;
  groups: Array<groupType>;
};

type matchTeamInfo = {
  id: string;
  name: string;
};

type matchMapInfo = {
  map: string;
  team1Score: number;
  team2Score: number;
};

type matchInfo = {
  id: string;
  team1: matchTeamInfo;
  team2: matchTeamInfo;
  maps: Array<matchMapInfo>;
  date: number;
};

const MatchHeader = styled.div`
  ${tw`bg-gray-600 w-full p-2`}
`;

const MatchContainer = styled.div`
  ${tw`sm:flex md:justify-between w-full  p-1 border-b border-gray-700`}
`;

const MatchDetails = styled.div`
  ${tw`flex-grow`}
`;

const MatchDate = styled.div`
  ${tw`flex-grow-0`}
`;

export default function Home() {
  const router = useRouter();
  const { leagueId } = router.query;
  const { isLoading, isError, data } = useLeague(leagueId);
  const {
    data: matchData,
    isLoading: isMatchLoading,
    isError: isMatchError,
  } = useQuery(
    ["match", leagueId],
    async ({ queryKey }) => {
      console.log(queryKey);

      const [_key, leagueId] = queryKey;

      const f = await fetch(`/api/match?leagueId=${leagueId}`);
      if (!f.ok) {
        throw new Error("Network response was not ok");
      }
      return f.json();
    },
    {
      enabled: !!leagueId,
    }
  );

  const t: Array<Array<matchInfo>> = matchData as Array<Array<matchInfo>>;

  const groups = data?.groups.map((p: groupType, i: number) => (
    <React.Fragment key={p.id}>
      {data?.groups.lenght > 1 ? <h1>Group {i + 1}</h1> : null}
      <GroupTable>
        <GroupHead>
          <tr>
            <th>Team</th>
            <th>M</th>
            <th>W</th>
            <th>L</th>
            <th>RW</th>
            <th>RL</th>
            <th>RD</th>
            <th>P</th>
          </tr>
        </GroupHead>
        <tbody>
          {p?.teams
            .sort(
              (a, b) =>
                b.points - a.points ||
                b.roundsWon - b.roundsLost - (a.roundsWon - a.roundsLost)
            )
            .map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.matches}</td>
              <td>{t.win}</td>
              <td>{t.loss}</td>
              <td>{t.roundsWon}</td>
              <td>{t.roundsLost}</td>
              <td>{t.roundsWon - t.roundsLost}</td>
              <td>{t.points}</td>
            </tr>
          ))}
        </tbody>
      </GroupTable>
    </React.Fragment>
  ));
  return (
    <Container>
      <Head>
        <title>{data?.name}</title>
      </Head>

      <Content>
        {isLoading && <span>Loading...</span>}
        {groups}
        {t &&
          t.map((g) =>
            g.map((match, index) => {
              let header = null;
              if (index % 4 == 0) {
                header = (
                  <MatchHeader>
                    Match Week {Math.floor(index / 4) + 1}
                  </MatchHeader>
                );
              }
              const date = new Date(match.date);
              return (
                <React.Fragment key={match.id}>
                  {header}
                  <MatchContainer key={match.id}>
                    <MatchDetails>
                      {match.team1.name} vs {match.team2.name}
                    </MatchDetails>
                    <MatchDate>
                      {date.toLocaleDateString()} - {date.toLocaleTimeString()}
                    </MatchDate>
                  </MatchContainer>
                </React.Fragment>
              );
            })
          )}
      </Content>
    </Container>
  );
}
