import React, { useState } from "react";
import AuthComponent from "../components/auth";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const onSignIn = (username: string, password: string) => {
    setIsLoading(true);
  };

  const onSignUp = (username: string, password: string) => {
    setIsLoading(true);
  };

  return (
    <AuthComponent onSignIn={onSignIn} onSignUp={onSignUp} isLoading={isLoading}></AuthComponent>
  );
}
