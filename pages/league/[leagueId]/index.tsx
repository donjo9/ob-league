import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { useLeague } from "../../../hooks/UseLeague";

const Container = styled.div`
  ${tw`bg-gray-800 text-blue-100`}
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const Content = styled.main`
  ${tw`m-2 p-8`}
`;

const GroupTable = styled.table`
  ${tw`bg-gray-700 p-2 w-3/5 table-auto  text-center`}
`;

const GroupHead = styled.thead`
  ${tw`bg-gray-900 m-2`}
`;
type TeamType = {
  name: string;
  id: string;
  win: number;
  loss: number;
  roundsWon: number;
  roundsLost: number;
};
type groupType = {
  id: string;
  teams: Array<TeamType>;
};

type leagueType = {
  name: string;
  groups: Array<groupType>;
};

export default function Home() {
  const router = useRouter();
  const { leagueId } = router.query;
  const { isLoading, isError, data } = useLeague(leagueId);

  const groups = data?.groups.map((p: groupType, i: number) => (
    <React.Fragment key={p.id}>
      <h1>Group {i + 1}</h1>
      <GroupTable>
        <GroupHead>
          <tr>
            <th>Team</th>
            <th>Wins</th>
            <th>Loss</th>
            <th>Rounds Won</th>
            <th>Rounds Lost</th>
            <th>Round Difference</th>
          </tr>
        </GroupHead>
        <tbody>
          {p?.teams.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.win}</td>
              <td>{t.loss}</td>
              <td>{t.roundsWon}</td>
              <td>{t.roundsLost}</td>
              <td>{t.roundsWon - t.roundsLost}</td>
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
      </Content>
    </Container>
  );
}
