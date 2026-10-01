import { useState } from "react";
import { agencyService } from "../../services/agency.service";
import { useApi } from "../../hooks/useApi";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
export default function AgenciesPage() {
  const { data = [], reload } = useApi(agencyService.list, []),
    [open, setOpen] = useState(false),
    [f, setF] = useState({
      name: "",
      code: "",
      phone: "",
      address: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const save = async (e) => {
    e.preventDefault();
    await agencyService.create(f);
    setOpen(false);
    reload();
  };
  return (
    <>
      <PageHeader
        title="Agencies"
        subtitle="Create and control tenant workspaces"
        action={<Button onClick={() => setOpen(true)}>+ New agency</Button>}
      />
      <div className="card overflow-hidden">
        <Table
          columns={[
            { key: "name", label: "Agency" },
            { key: "code", label: "Code" },
            { key: "phone", label: "Phone" },
            {
              key: "active",
              label: "Status",
              render: (r) => (r.active ? "Active" : "Disabled"),
            },
          ]}
          data={data}
        />
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Create agency">
        <form onSubmit={save} className="space-y-3">
          {[
            ["name", "Agency name"],
            ["code", "Agency code"],
            ["phone", "Phone"],
            ["address", "Address"],
            ["adminName", "Admin name"],
            ["adminEmail", "Admin email"],
            ["adminPassword", "Admin password"],
          ].map(([k, l]) => (
            <Input
              key={k}
              label={l}
              type={
                k === "adminEmail"
                  ? "email"
                  : k === "adminPassword"
                    ? "password"
                    : "text"
              }
              value={f[k]}
              onChange={(e) => set(k, e.target.value)}
              required={[
                "name",
                "code",
                "adminName",
                "adminEmail",
                "adminPassword",
              ].includes(k)}
            />
          ))}
          <Button className="w-full">Create agency</Button>
        </form>
      </Modal>
    </>
  );
}
