import { useState } from "react";
import { ListComponent, APIKeyInfo } from "../components/list";

export default function ListPage() {
  const [isCreating, setIsCreating] = useState(false);

  const data: APIKeyInfo[] = [
    {
      id: "key-0",
      name: "My Key",
      status: "Active",
    },
    {
      id: "key-1",
      name: "Another Key",
      status: "Active",
    },
  ];

  const onCreate = (name: string) => {
    setIsCreating(true);
  };

  const onToggle = (id: string) => {
    console.log("toggle", id);
  };

  const onRequestVisit = (id: string) => {
    console.log("visit", id);
  };

  return (
    <ListComponent
      isCreating={isCreating}
      onCreate={onCreate}
      onToggle={onToggle}
      onRequestVisit={onRequestVisit}
      data={data}
    ></ListComponent>
  );
}
