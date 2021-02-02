import { ApolloProvider } from "@apollo/client";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AuthPage from "./pages/auth";
import ListPage from "./pages/list";
import client from "./client";

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthPage>
          <Route exact path="/">
            <ListPage></ListPage>
          </Route>
        </AuthPage>
      </Router>
    </ApolloProvider>
  );
}

export default App;
