
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Archive, 
  Book, 
  Calendar, 
  FileCheck, 
  FlaskConical, 
  Info
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MOCK_SPIRITS, 
  MOCK_BATCHES, 
  MOCK_OPERATIONS, 
  MOCK_REPORTS,
  sumOperationsByType
} from "@/lib/models";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon 
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

const RecentActivityItem = ({ 
  activity 
}: { 
  activity: {
    id: string;
    type: string;
    date: Date;
    description: string;
    amount: string;
  }
}) => (
  <div className="flex items-start space-x-4 py-3">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
      {activity.type === 'production' && <FlaskConical className="h-5 w-5 text-primary" />}
      {activity.type === 'bottling' && <Archive className="h-5 w-5 text-primary" />}
      {activity.type === 'loss' && <Info className="h-5 w-5 text-primary" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{activity.description}</p>
      <p className="text-xs text-muted-foreground">{format(activity.date, 'MMM dd, yyyy')}</p>
    </div>
    <div className="text-sm font-medium">{activity.amount}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Create date range for current month
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Calculate this month's stats
  const monthProduction = sumOperationsByType(MOCK_OPERATIONS, 'production', startOfMonth, endOfMonth);
  const monthBottling = sumOperationsByType(MOCK_OPERATIONS, 'bottling', startOfMonth, endOfMonth);
  const monthLosses = sumOperationsByType(MOCK_OPERATIONS, 'loss', startOfMonth, endOfMonth);
  
  // Recent activity
  const recentActivity = MOCK_OPERATIONS.map(op => ({
    id: op.id,
    type: op.type,
    date: op.date,
    description: `${op.type.replace('_', ' ')} - ${MOCK_SPIRITS.find(s => s.id === op.spiritId)?.name || 'Unknown Spirit'}`,
    amount: `${op.proofGallons.toFixed(1)} PG`,
  })).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  
  // Upcoming reports
  const upcomingReports = [
    {
      id: '1',
      formName: 'Form 5110.40',
      formTitle: 'Monthly Report of Operations',
      dueDate: new Date(currentYear, currentMonth + 1, 15),
      status: 'pending',
      path: '/reports/5110-40',
    },
    {
      id: '2',
      formName: 'Form 5110.28',
      formTitle: 'Bottling and Packaging Report',
      dueDate: new Date(currentYear, currentMonth + 1, 15),
      status: 'pending',
      path: '/reports/5110-28',
    },
    {
      id: '3',
      formName: 'Form 5110.11',
      formTitle: 'Excise Tax Return',
      dueDate: new Date(currentYear, currentMonth + 1, 15),
      status: 'pending',
      path: '/reports/5110-11',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's what's happening at {user?.organization.name}.
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
            <StatCard
              title="Production This Month"
              value={`${monthProduction.toFixed(1)} PG`}
              description="Proof gallons produced in current period"
              icon={FlaskConical}
            />
            
            <StatCard
              title="Bottling This Month"
              value={`${monthBottling.toFixed(1)} PG`}
              description="Proof gallons bottled in current period"
              icon={Archive}
            />
            
            <StatCard
              title="Losses This Month"
              value={`${monthLosses.toFixed(1)} PG`}
              description="Proof gallons of reported losses"
              icon={Info}
            />
            
            <StatCard
              title="Total Batches"
              value={MOCK_BATCHES.length}
              description="Active batches in production or aging"
              icon={Book}
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest operations logged in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.map(activity => (
                    <RecentActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
                <Button variant="link" className="mt-4 px-0" asChild>
                  <Link to="/operations">
                    View all operations
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Upcoming Reports</CardTitle>
                <CardDescription>TTB reports due in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingReports.map(report => (
                    <div key={report.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{report.formName}</p>
                        <p className="text-xs text-muted-foreground">{report.formTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Due {format(report.dueDate, 'MMM dd')}
                        </span>
                        <Button asChild size="sm">
                          <Link to={report.path}>
                            Prepare
                          </Link>
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
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Form 5110.40 - Monthly Report of Operations</h3>
                  <p className="text-sm text-muted-foreground">
                    Summarizes total amount of spirits produced, bottled, transferred, 
                    lost, or disposed of during the month.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Due monthly by the 15th
                    </span>
                    <Button asChild size="sm">
                      <Link to="/reports/5110-40">
                        <Calendar className="mr-2 h-4 w-4" />
                        Start New Report
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Form 5110.28 - Bottling and Packaging Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Tracks bottling activity, including bottle size, proof, and number 
                    of bottles filled per run.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Due monthly by the 15th
                    </span>
                    <Button asChild size="sm">
                      <Link to="/reports/5110-28">
                        <Calendar className="mr-2 h-4 w-4" />
                        Start New Report
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Form 5110.11 - Excise Tax Return</h3>
                  <p className="text-sm text-muted-foreground">
                    Calculates excise tax based on domestic withdrawals, derived from 
                    bottling and transfer logs.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Due monthly by the 15th
                    </span>
                    <Button asChild size="sm">
                      <Link to="/reports/5110-11">
                        <Calendar className="mr-2 h-4 w-4" />
                        Start New Report
                      </Link>
                    </Button>
                  </div>
                </div>
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
                <div className="space-y-4">
                  {MOCK_SPIRITS.map(spirit => (
                    <div key={spirit.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{spirit.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {spirit.type} | {spirit.defaultProof} proof
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/spirits/${spirit.id}`}>
                          View Batches
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-4 px-0" asChild>
                  <Link to="/spirits">
                    Manage spirits & batches
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Batches</CardTitle>
                <CardDescription>Batches currently in production or aging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_BATCHES.map(batch => {
                    const spirit = MOCK_SPIRITS.find(s => s.id === batch.spiritId);
                    return (
                      <div key={batch.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Batch {batch.batchNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {spirit?.name} | {batch.currentLiters.toFixed(1)} liters | {batch.proof} proof
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            Status: {batch.status.replace('_', ' ')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/operations?batchId=${batch.id}`}>
                            Log Operation
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
