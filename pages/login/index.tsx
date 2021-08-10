import * as React from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";

const Container = styled.div`
  ${tw`bg-gray-800 text-blue-100 flex items-center justify-center `}
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const Form = styled.form`
  ${tw`flex flex-col max-w-md w-full space-y-8 text-blue-900`}
`;
type LoginType = {
  userName: string;
  password: string;
};
const Login = () => {
  const { register, handleSubmit } = useForm();
  const [result, setResult] = React.useState("");
  const onSubmit = (data: LoginType) =>
    setResult(JSON.stringify(data, null, 2));
  return (
    <Container>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("userName")} placeholder="Username" />
        <input
          {...register("password")}
          placeholder="Password"
          type="Password"
        />
        <input type="submit" value="Login" />
        <p>{result}</p>
      </Form>
    </Container>
  );
};

export default Login;
