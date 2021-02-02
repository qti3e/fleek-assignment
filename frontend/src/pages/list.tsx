import { ListComponent, APIKeyInfo } from "../components/list";
import { gql, useQuery, useMutation } from "@apollo/client";

const GET_API_KEYS = gql`
  query APIKeys {
    ownedAPIKeys {
      key
      name
      is_enabled
    }
  }
`;

const NEW_API_KEY = gql`
  mutation NewAPIKey($name: String!) {
    createAPIKey(name: $name) {
      key
      name
      is_enabled
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateStatus($key: String!, $is_enabled: Boolean!) {
    updateStatus(key: $key, is_enabled: $is_enabled)
  }
`;

export default function ListPage() {
  const [createNewAPIKey] = useMutation(NEW_API_KEY);
  const [setStatus] = useMutation(UPDATE_STATUS);
  const { loading, error, data } = useQuery(GET_API_KEYS);

  if (loading) return <div>Loading</div>;
  if (error) return <div>Error! Please refresh the page.</div>;

  const tableData: APIKeyInfo[] = data.ownedAPIKeys.map((r: any) => ({
    id: r.key,
    name: r.name,
    status: r.is_enabled ? "Active" : "Disabled",
  }));

  const onCreate = (name: string) => {
    createNewAPIKey({
      variables: { name },
      refetchQueries: [
        {
          query: GET_API_KEYS,
        },
      ],
    });
  };

  const setStatusCb = (key: string, is_enabled: boolean) => {
    setStatus({
      variables: { key, is_enabled },
      refetchQueries: [
        {
          query: GET_API_KEYS,
        },
      ],
    });
  };

  const onRequestVisit = (id: string) => {
    console.log("visit", id);
  };

  return (
    <ListComponent
      onCreate={onCreate}
      setStatus={setStatusCb}
      onRequestVisit={onRequestVisit}
      data={tableData}
    ></ListComponent>
  );
}
