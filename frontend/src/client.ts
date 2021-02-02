import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let token: string;

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === "production" ? "/graphql" : "http://127.0.0.1:8081/graphql",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;

/**
 * Set the token for the current session.
 * @param t The token to be used.
 */
export function setToken(t: string) {
  token = t;
}
