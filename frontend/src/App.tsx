import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AuthPage from "./pages/auth";
import ListPage from "./pages/list";

function App() {
  return (
    <Router>
      <Route exact path="/">
        <AuthPage></AuthPage>
      </Route>
      <Route path="/list">
        <ListPage></ListPage>
      </Route>
    </Router>
  );
}

export default App;
