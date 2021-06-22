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

const Header = styled.h1`
  ${tw`font-bold text-6xl`}
`;

const StyledLink = styled.a`
  ${tw`text-xl`}
`;

type Players = {
  id: string;
  name: string;
};

type TeamAndPlayer = {
  id: string;
  name: string;
  players: Array<Players>;
};

export default function Home() {
  const router = useRouter();
  const { teamId } = router.query;
  const [team, setTeam] = useState<TeamAndPlayer>({
    id: "",
    name: "",
    players: [],
  });
  useEffect(() => {
    const test = async () => {
      const f = await fetch(`http://localhost:3000/api/team/${teamId}`);
      const t = await f.json();
      console.log(t);
      setTeam(t);
    };
    if (teamId) {
      test();
    }
  }, [teamId]);

  const t = team.players.map((p) => (
    <tr key={p.id}>
      <td>{p.name}</td>
    </tr>
  ));
  return (
    <Container>
      <Head>
        <title>Oldboys league</title>
      </Head>

      <Content>
        <table>
          <thead>
            <tr>
              <th>{team.name}</th>
            </tr>
          </thead>
          <tbody>{t}</tbody>
        </table>
      </Content>
    </Container>
  );
}
