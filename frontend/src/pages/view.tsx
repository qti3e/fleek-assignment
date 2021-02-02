import { gql, useQuery, useSubscription } from "@apollo/client";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ViewComponent from "../components/view";

const GET_DATA = gql`
  query GetData($key: String!) {
    log(key: $key)
    metricsSnapshot(key: $key) {
      min {
        bytes_transferred
        req_count
      }
      hour {
        bytes_transferred
        req_count
      }
      day {
        bytes_transferred
        req_count
      }
    }
  }
`;

const SUB = gql`
  subscription OnLog($repoFullName: String!) {
    log(key: $repoFullName)
  }
`;

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();

  const { loading, error, data, refetch } = useQuery(GET_DATA, {
    variables: {
      key: id,
    },
  });

  useEffect(() => {
    // TODO(qti3e) Use SUB.
    const timer = setInterval(() => {
      if (data) refetch();
    }, 1e3);

    return () => clearInterval(timer);
  });

  if (loading) return <div>Loading</div>;
  if (error) return <div>Error! Please refresh the page.</div>;

  return <ViewComponent apiKey={id} log={data.log} metrics={data.metricsSnapshot}></ViewComponent>;
}
