import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Archive,
  Book,
  Calendar,
  FileCheck,
  FlaskConical,
  Info,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { spiritsService } from "@/lib/supabase/spirits";
import { batchesService } from "@/lib/supabase/batches";
import { operationsService } from "@/lib/supabase/operations";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Spirit = Database['public']['Tables']['spirits']['Row'];
type Batch = Database['public']['Tables']['batches']['Row'];
type Operation = Database['public']['Tables']['operations']['Row'];

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

const iconFor = (type: string) => {
  if (type === 'production' || type === 'redistillation') return <FlaskConical className="h-5 w-5 text-primary" />;
  if (type === 'bottling') return <Archive className="h-5 w-5 text-primary" />;
  return <Info className="h-5 w-5 text-primary" />;
};

const Dashboard = () => {
  const { user } = useSupabaseAuth();
  const organizationId = user?.organization?.id;

  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!organizationId) return;
      setLoading(true);
      try {
        const [s, b, o] = await Promise.all([
          spiritsService.getAll(organizationId),
          batchesService.getAll(organizationId),
          operationsService.getAll(organizationId),
        ]);
        if (cancelled) return;
        setSpirits(s);
        setBatches(b);
        setOperations(o);
      } catch (err) {
        console.error('[dashboard] load error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const now = new Date();
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);

  const monthOps = operations.filter((op) => {
    const d = new Date(op.operation_date);
    return d >= startMonth && d <= endMonth;
  });

  const sumBy = (type: string) =>
    monthOps.filter((o) => o.type === type).reduce((a, o) => a + Number(o.proof_gallons || 0), 0);

  const monthProduction = sumBy('production');
  const monthBottling = sumBy('bottling');
  const monthLosses = sumBy('loss');

  const recentActivity = [...operations]
    .sort((a, b) => new Date(b.operation_date).getTime() - new Date(a.operation_date).getTime())
    .slice(0, 5)
    .map((op) => ({
      id: op.id,
      type: op.type,
      date: new Date(op.operation_date),
      description: `${op.type.replace('_', ' ')} - ${spirits.find((s) => s.id === op.spirit_id)?.name || 'Unassigned spirit'}`,
      amount: `${Number(op.proof_gallons).toFixed(1)} PG`,
    }));

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const upcomingReports = [
    { id: '1', formName: 'Form 5110.40', formTitle: 'Monthly Report of Operations', dueDate: new Date(currentYear, currentMonth + 1, 15), path: '/reports/5110-40' },
    { id: '2', formName: 'Form 5110.28', formTitle: 'Bottling and Packaging Report', dueDate: new Date(currentYear, currentMonth + 1, 15), path: '/reports/5110-28' },
    { id: '3', formName: 'Form 5110.11', formTitle: 'Excise Tax Return', dueDate: new Date(currentYear, currentMonth + 1, 15), path: '/reports/5110-11' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.profile?.first_name} {user?.profile?.last_name}. Here's what's happening at {user?.organization?.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/operations">
              <Book className="mr-2 h-4 w-4" />
              Log Operation
            </Link>
          </Button>
          <Button asChild>
            <Link to="/reports/5110-40">
              <FileCheck className="mr-2 h-4 w-4" />
              Start Monthly Report
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Production This Month" value={`${monthProduction.toFixed(1)} PG`} description="Proof gallons produced in current period" icon={FlaskConical} />
            <StatCard title="Bottling This Month" value={`${monthBottling.toFixed(1)} PG`} description="Proof gallons bottled in current period" icon={Archive} />
            <StatCard title="Losses This Month" value={`${monthLosses.toFixed(1)} PG`} description="Proof gallons of reported losses" icon={Info} />
            <StatCard title="Total Batches" value={batches.length} description="Active batches in production or aging" icon={Book} />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest operations logged in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground py-6">Loading…</p>
                ) : recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6">No operations recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 py-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {iconFor(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{format(activity.date, 'MMM dd, yyyy')}</p>
                        </div>
                        <div className="text-sm font-medium">{activity.amount}</div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="link" className="mt-4 px-0" asChild>
                  <Link to="/operations">View all operations</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reports</CardTitle>
                <CardDescription>TTB reports due in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{report.formName}</p>
                        <p className="text-xs text-muted-foreground">{report.formTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Due {format(report.dueDate, 'MMM dd')}</span>
                        <Button asChild size="sm">
                          <Link to={report.path}>Prepare</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>TTB Reporting Requirements</CardTitle>
              <CardDescription>Overview of your required federal reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingReports.map((r) => (
                  <div key={r.id} className="space-y-2">
                    <h3 className="text-lg font-medium">{r.formName} — {r.formTitle}</h3>
                    <p className="text-sm text-muted-foreground">Due monthly by the 15th.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button asChild size="sm">
                        <Link to={r.path}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Open Report
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spirit Products</CardTitle>
                <CardDescription>Your registered spirit products</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground py-6">Loading…</p>
                ) : spirits.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6">No spirits have been added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {spirits.map((spirit) => (
                      <div key={spirit.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{spirit.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {spirit.type} | {spirit.default_proof} proof
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="link" className="mt-4 px-0" asChild>
                  <Link to="/spirits">Manage spirits &amp; batches</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Batches</CardTitle>
                <CardDescription>Batches currently in production or aging</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground py-6">Loading…</p>
                ) : batches.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6">No production batches have been created.</p>
                ) : (
                  <div className="space-y-4">
                    {batches.map((batch) => {
                      const spirit = spirits.find((s) => s.id === batch.spirit_id);
                      return (
                        <div key={batch.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Batch {batch.batch_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {spirit?.name ?? 'Unassigned spirit'} | {Number(batch.current_liters).toFixed(1)} liters | {batch.proof} proof
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              Status: {batch.status.replace('_', ' ')}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/operations?batchId=${batch.id}`}>Log Operation</Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
