import type { AppProps /*, AppContext */ } from "next/app";
import { QueryClientProvider, QueryClient } from "react-query";
import styled from "styled-components";
import tw from "twin.macro";
import "../styles/globals.css";
import { AuthProvider } from "../utils/useAuth";
const queryClient = new QueryClient();
const Container = styled.div`
  ${tw`bg-gray-800 text-blue-100`}
  height: 100%;
  width: 100%;
  overflow: auto;
`;
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Container>
          <Component {...pageProps} />
        </Container>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
