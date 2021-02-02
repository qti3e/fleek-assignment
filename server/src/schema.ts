import { gql } from "apollo-server-express";

export default gql`
  type Subscription {
    log(key: String!): String!
  }

  type Query {
    ownedAPIKeys: [APIKeyDetail!]!
    metricsSnapshot(key: String!): MetricsSnapshot
    log(key: String!): String!
  }

  type Mutation {
    createAPIKey(name: String!): APIKeyDetail!
    updateStatus(key: String!, is_enabled: Boolean!): Boolean!
    signIn(input: AuthInput!): AuthResult!
    signUp(input: AuthInput!): AuthResult!
  }

  input AuthInput {
    username: String!
    password: String!
  }

  type AuthResultOk {
    token: String!
  }

  type AuthResultErr {
    message: String!
  }

  union AuthResult = AuthResultOk | AuthResultErr

  type APIKeyDetail {
    key: String!
    name: String!
    is_enabled: Boolean!
  }

  type MetricsSnapshot {
    min: Metric!
    hour: Metric!
    day: Metric!
  }

  type Metric {
    bytes_transferred: Int!
    req_count: Int!
  }
`;
