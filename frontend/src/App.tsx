import { ApolloProvider } from "@apollo/client";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AuthPage from "./pages/auth";
import ListPage from "./pages/list";
import client from "./client";
import ViewPage from './pages/view';

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthPage>
          <Route exact path="/">
            <ListPage></ListPage>
          </Route>
          <Route exact path="/view/:id">
            <ViewPage></ViewPage>
          </Route>
        </AuthPage>
      </Router>
    </ApolloProvider>
  );
}

export default App;
