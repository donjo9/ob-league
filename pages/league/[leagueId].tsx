import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";

const Container = styled.div`
  ${tw`bg-gray-800 text-blue-100`}
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const Content = styled.main`
  ${tw`m-2 p-8`}
`;

type TeamType = {
  name: string;
  id: string;
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
  const [league, setLeague] = useState<leagueType>({
    name: "",
    groups: [],
  });
  useEffect(() => {
    const test = async () => {
      const f = await fetch(`http://localhost:3000/api/league/${leagueId}`);
      const t = await f.json();
      console.log(t);
      setLeague(t);
    };
    if (leagueId) {
      test();
    }
  }, [leagueId]);

  const groups = league.groups.map((p: groupType, i: number) => (
    <table key={p.id}>
      <thead>
        <tr>
          <th>Group {i + 1}</th>
        </tr>
      </thead>
      <tbody>
        {p?.teams.map((t) => (
          <tr key={t.id}>
            <td>{t.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ));
  return (
    <Container>
      <Head>
        <title>{league.name}</title>
      </Head>

      <Content>{groups}</Content>
    </Container>
  );
}
