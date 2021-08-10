import Head from "next/head";
import Link from "next/link";
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

export default function Home() {
  const [teams, setTeams] = useState<Array<any>>([]);
  useEffect(() => {
    const test = async () => {
      const f = await fetch("/api/league");
      const t = await f.json();
      setTeams(t);
    };
    test();
  }, []);

  const t = teams.map((p) => (
    <tr key={p.id}>
      <td>
        <Link href={`/league/${p.id}`}>
          <a>{p.name}</a>
        </Link>
      </td>
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
              <th>Leagues</th>
            </tr>
          </thead>
          <tbody>{t}</tbody>
        </table>
      </Content>
    </Container>
  );
}
