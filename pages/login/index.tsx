import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";
import { useAuth } from "../../utils/useAuth";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";

export type LoginInputType = {
  email: string;
  password: string;
};
const LoginContainer = styled.div`
  ${tw`flex justify-center w-full h-full items-center p-4`}
`;
const LoginForm = styled.form`
  ${tw`flex flex-col border rounded-xl min-h-full border-gray-700 w-1/5 bg-gray-600 p-6`}
`;

const LoginInput = styled.input`
  ${tw`bg-gray-800 rounded p-2 m-2`}
`;

const LoginButton = styled.input`
  ${tw`bg-green-500 rounded p-4 m-2 cursor-pointer`}
`;

const Login = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputType>();
  const { setUserInfo } = useAuth();

  const onSubmit: SubmitHandler<LoginInputType> = async (data) => {
    const { email, password } = data;

    const respons = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const user = await respons.json();
    if (user.error) {
      console.log(user);

      toast.error(user.error);
      return;
    }
    setUserInfo(user);
    router.push("/");
  };

  return (
    <LoginContainer>
      <Toaster />
      <LoginForm onSubmit={handleSubmit(onSubmit)}>
        <LoginInput {...register("email")} placeholder="email" type="text" />
        <LoginInput
          {...register("password")}
          placeholder="password"
          type="password"
        />
        <LoginButton type="submit" value="Login" />
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;
