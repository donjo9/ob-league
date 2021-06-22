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

export default function Home() {
  const router = useRouter();
  const { leagueId } = router.query;
  const [league, setLeague] = useState<any>({
    id: "",
    name: "",
    players: [],
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

  const t = league.map((p: any) => (
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
              <th>{league.name}</th>
            </tr>
          </thead>
          <tbody>{t}</tbody>
        </table>
      </Content>
    </Container>
  );
}
