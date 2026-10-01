import { useApi } from "../../hooks/useApi";
import { dashboardService } from "../../services/dashboard.service";
import PageHeader from "../../components/layout/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { Building2, Users } from "lucide-react";
export default function MasterDashboardPage() {
  const { data, loading } = useApi(dashboardService.master, []);
  return (
    <>
      <PageHeader
        title="Master Control"
        subtitle="Global SaaS administration"
      />
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Agencies"
            value={data.agencies}
            icon={<Building2 size={19} />}
          />
          <StatCard
            label="Users"
            value={data.users}
            icon={<Users size={19} />}
          />
        </div>
      )}
    </>
  );
}
