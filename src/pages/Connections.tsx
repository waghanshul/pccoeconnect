import { AppLayout } from "@/components/layout/AppLayout";
import { ConnectionsList } from "@/components/connections/ConnectionsList";

const Connections = () => {
  return (
    <AppLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Connections</h1>
        <p className="text-sm text-muted-foreground mb-6">Find and connect with other students</p>
        <ConnectionsList />
      </div>
    </AppLayout>
  );
};

export default Connections;
