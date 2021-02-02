import React from "react";
import AuthComponent from "../components/auth";
import { gql, useMutation } from "@apollo/client";
import { setToken } from "../client";

const SIGN_IN = gql`
  mutation SignIn($username: String!, $password: String!) {
    signIn(input: { username: $username, password: $password }) {
      ... on AuthResultOk {
        token
      }
      ... on AuthResultErr {
        message
      }
    }
  }
`;

const SIGN_UP = gql`
  mutation SignUp($username: String!, $password: String!) {
    signUp(input: { username: $username, password: $password }) {
      ... on AuthResultOk {
        token
      }
      ... on AuthResultErr {
        message
      }
    }
  }
`;

type AuthResponse = {
  token?: string;
  message?: string;
};

export default function AuthPage(props: { children: React.ReactNode }) {
  const [signIn, { data: signInData, loading: signInLoading }] = useMutation<{
    signIn: AuthResponse;
  }>(SIGN_IN);
  const [signUp, { data: signUpData, loading: signUpLoading }] = useMutation<{
    signUp: AuthResponse;
  }>(SIGN_UP);

  const isLoading = signInLoading || signUpLoading;
  const token = signInData?.signIn.token || signUpData?.signUp.token;

  if (token) {
    setToken(token);
    return <React.Fragment>{props.children}</React.Fragment>;
  }

  const onSignIn = async (username: string, password: string) => {
    signIn({ variables: { username, password } });
  };

  const onSignUp = (username: string, password: string) => {
    signUp({ variables: { username, password } });
  };

  return (
    <AuthComponent onSignIn={onSignIn} onSignUp={onSignUp} isLoading={isLoading}></AuthComponent>
  );
}
