import React, { useState } from "react";
import AuthComponent from "../components/auth";
import { gql, useMutation } from "@apollo/client";
import { setToken } from "../client";
import { Header, HeaderGlobalAction, HeaderGlobalBar, HeaderName } from "carbon-components-react";
import { Logout20 } from "@carbon/icons-react";

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
  const [loggedOut, setLoggedOut] = useState(false);
  const [signIn, { data: signInData, loading: signInLoading }] = useMutation<{
    signIn: AuthResponse;
  }>(SIGN_IN);
  const [signUp, { data: signUpData, loading: signUpLoading }] = useMutation<{
    signUp: AuthResponse;
  }>(SIGN_UP);

  const isLoading = signInLoading || signUpLoading;
  const token =
    sessionStorage.getItem("__token") || signInData?.signIn.token || signUpData?.signUp.token;

  function logout() {
    setLoggedOut(true);
    sessionStorage.removeItem("__token");
  }

  if (token && !loggedOut) {
    setToken(token);
    sessionStorage.setItem("__token", token);
    return (
      <React.Fragment>
        <Header aria-label="">
          <HeaderName href="#" prefix="Fleek">
            [IPFS Manager]
          </HeaderName>
          <HeaderGlobalBar>
            <HeaderGlobalAction aria-label="Log out" onClick={logout}>
              <Logout20 />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
        <div style={{ marginTop: 30 }}>{props.children}</div>
      </React.Fragment>
    );
  }

  const onSignIn = async (username: string, password: string) => {
    signIn({ variables: { username, password } });
    setLoggedOut(false);
  };

  const onSignUp = (username: string, password: string) => {
    signUp({ variables: { username, password } });
    setLoggedOut(false);
  };

  return (
    <AuthComponent onSignIn={onSignIn} onSignUp={onSignUp} isLoading={isLoading}></AuthComponent>
  );
}
