import React from "react";
import {
  Button,
  DataTable,
  DataTableCustomRenderProps,
  Table,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  OverflowMenu,
  OverflowMenuItem,
  Modal,
  TextInput,
} from "carbon-components-react";
import { Add16 } from "@carbon/icons-react";

export interface Props {
  isCreating: boolean;
  onCreate(name: string): void;
  onToggle(id: string): void;
  onRequestVisit(id: string): void;
  data: APIKeyInfo[];
}

export interface APIKeyInfo {
  id: string;
  name: string;
  status: "Active" | "Disabled";
}

interface State {
  isCreateModalOpen: boolean;
  name: string;
}

export class ListComponent extends React.Component<Props, State> {
  state = {
    isCreateModalOpen: false,
    name: "",
  };

  constructor(props: Props) {
    super(props);
    this.handleCreate = this.handleCreate.bind(this);
  }

  handleCreate() {
    this.props.onCreate(this.state.name);
    this.setState((s) => ({
      ...s,
      isCreateModalOpen: false,
      name: "",
    }));
  }

  render() {
    const { name, isCreateModalOpen } = this.state;

    return (
      <React.Fragment>
        <Modal
          open={isCreateModalOpen}
          onRequestSubmit={this.handleCreate}
          onRequestClose={() => this.setState((s) => ({ ...s, isCreateModalOpen: false }))}
          modalHeading="Create New API-Key"
          primaryButtonText="Create"
          secondaryButtonText="Cancel"
          hasForm
          selectorPrimaryFocus="#name-input"
        >
          <TextInput
            id="name-input"
            labelText="Name"
            placeholder="Enter name..."
            value={name}
            onChange={(e) => this.setState((s) => ({ ...s, name: e.target.value }))}
          />
        </Modal>
        <DataTable rows={this.props.data} headers={headers}>
          {({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getToolbarProps,
            onInputChange,
            getTableContainerProps,
          }: DataTableCustomRenderProps<any, any>) => (
            <TableContainer
              title="API Keys"
              description="View & Manage Your API Keys"
              {...getTableContainerProps()}
            >
              <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                <TableToolbarContent>
                  <Button
                    renderIcon={Add16}
                    iconDescription="Add"
                    onClick={() => this.setState((s) => ({ ...s, isCreateModalOpen: true }))}
                  >
                    Add API-Key
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader></TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <TableCell className="bx--table-column-menu">
                        <OverflowMenu light flipped>
                          <OverflowMenuItem
                            itemText="Toggle Status"
                            onClick={() => this.props.onToggle(row.id)}
                          />
                          <OverflowMenuItem
                            itemText="View"
                            onClick={() => this.props.onRequestVisit(row.id)}
                          />
                        </OverflowMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </React.Fragment>
    );
  }
}

const headers = [
  {
    header: "Name",
    key: "name",
  },
  {
    header: "Status",
    key: "status",
  },
];
