import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import CalendarIcon from "@/components/icons/CalendarIcon";
import { Download, FileText, Printer } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateReport, saveReportFields, Report5110_11Data } from "@/lib/reportData";
import { toast } from "@/components/ui/sonner";

type OpRow = {
  id: string;
  operation_date: string;
  type: string;
  proof: number | null;
  liters: number;
  proof_gallons: number;
};

const Report5110_11 = () => {
  const { user } = useSupabaseAuth();
  const organizationId = user?.organization?.id;
  const [reportPeriod, setReportPeriod] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [reportData, setReportData] = useState<Report5110_11Data | null>(null);
  const [operations, setOperations] = useState<OpRow[]>([]);
  const [loading, setLoading] = useState(false);

  const startDate = startOfMonth(reportPeriod);
  const endDate = endOfMonth(reportPeriod);

  const loadReport = useCallback(async () => {
    if (!organizationId || !user) return;
    setLoading(true);
    try {
      const data = await getOrCreateReport<Report5110_11Data>(organizationId, user.id, '5110-11', reportPeriod);
      setReportData(data);
      const { data: ops, error } = await supabase
        .from('operations')
        .select('id, operation_date, type, proof, liters, proof_gallons')
        .eq('organization_id', organizationId)
        .gte('operation_date', startDate.toISOString())
        .lte('operation_date', endDate.toISOString())
        .order('operation_date', { ascending: true });
      if (error) throw error;
      setOperations((ops ?? []) as OpRow[]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, user?.id, reportPeriod]);

  useEffect(() => { void loadReport(); }, [loadReport]);

  const updateReportField = async (field: keyof Report5110_11Data, value: any) => {
    if (!reportData || !organizationId || !user) return;
    setReportData({ ...reportData, [field]: value } as Report5110_11Data);
    try {
      const saved = await saveReportFields<Report5110_11Data>(organizationId, user.id, '5110-11', reportPeriod, { [field]: value } as any);
      setReportData(saved);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save report');
    }
  };

  const handleDownloadPDF = () => {
    toast.success('Downloading TTB Form 5110.11', { description: `TTB_5110_11_${format(reportPeriod, 'yyyy-MM')}.txt` });
  };
  const handlePrintReport = () => {
    toast.success('Preparing TTB Form 5110.11 for printing');
    setTimeout(() => window.print(), 300);
  };

  const inv = reportData?.inventory;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form 5110.11</h1>
          <p className="text-muted-foreground">Monthly Report of Storage Operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrintReport}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button variant="outline" onClick={handleDownloadPDF}><Download className="mr-2 h-4 w-4" />Download PDF</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" />Monthly Report of Storage Operations (Form 5110.11)</CardTitle>
          <CardDescription>Reporting period: {format(reportPeriod, 'MMMM yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="report">
            <TabsList className="mb-6">
              <TabsTrigger value="report">Report</TabsTrigger>
              <TabsTrigger value="info">Storage Information</TabsTrigger>
              <TabsTrigger value="operations">Operations Detail</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Reporting Period</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />{format(reportPeriod, 'MMMM yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto">
                      <Calendar mode="single" selected={reportPeriod} onSelect={(d) => d && setReportPeriod(startOfMonth(d))} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2"><Label>Registration Number</Label><Input value={reportData?.registrationNumber || ''} onChange={(e) => updateReportField('registrationNumber', e.target.value)} placeholder="DSP-XX-12345" /></div>
                <div className="space-y-2"><Label>Proprietor Name</Label><Input value={reportData?.proprietorName || ''} onChange={(e) => updateReportField('proprietorName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Storage Facility Address</Label><Input value={reportData?.proprietorAddress || ''} onChange={(e) => updateReportField('proprietorAddress', e.target.value)} /></div>
                <div className="space-y-2"><Label>EIN Number</Label><Input value={reportData?.einNumber || ''} onChange={(e) => updateReportField('einNumber', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportData?.reportType || 'original'} onValueChange={(v: 'original' | 'amended' | 'final') => updateReportField('reportType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original</SelectItem>
                      <SelectItem value="amended">Amended</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="report">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">Description</th>
                      <th className="text-right p-3 w-48">Proof Gallons</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-3">1. Beginning inventory</td><td className="p-3 text-right">{inv?.beginningInventory.toFixed(1) ?? '0.0'}</td></tr>
                    <tr className="border-b"><td className="p-3">2. Deposited in storage</td><td className="p-3 text-right">{inv?.production.toFixed(1) ?? '0.0'}</td></tr>
                    <tr className="border-b"><td className="p-3">3. Received in storage</td><td className="p-3 text-right">{inv?.transferIn.toFixed(1) ?? '0.0'}</td></tr>
                    <tr className="border-b bg-muted/20"><td className="p-3 font-medium">4. Total (1 + 2 + 3)</td><td className="p-3 text-right font-medium">{inv ? (inv.beginningInventory + inv.production + inv.transferIn).toFixed(1) : '0.0'}</td></tr>
                    <tr className="border-b"><td className="p-3">5. Withdrawn from storage</td><td className="p-3 text-right">{inv?.bottling.toFixed(1) ?? '0.0'}</td></tr>
                    <tr className="border-b"><td className="p-3">6. Loss in storage</td><td className="p-3 text-right">{inv?.loss.toFixed(1) ?? '0.0'}</td></tr>
                    <tr className="border-b bg-muted/20"><td className="p-3 font-medium">7. Total removed (5 + 6)</td><td className="p-3 text-right font-medium">{inv ? (inv.bottling + inv.loss).toFixed(1) : '0.0'}</td></tr>
                    <tr className="border-b bg-muted/50"><td className="p-3 font-bold">8. Ending inventory (4 - 7)</td><td className="p-3 text-right font-bold">{inv?.endingInventory.toFixed(1) ?? '0.0'}</td></tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="operations">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-right">Proof</th>
                      <th className="p-3 text-right">Liters</th>
                      <th className="p-3 text-right">Proof Gallons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((op) => (
                      <tr key={op.id} className="border-b">
                        <td className="p-3">{format(new Date(op.operation_date), 'MM/dd/yyyy')}</td>
                        <td className="p-3 capitalize">{op.type.replace('_', ' ')}</td>
                        <td className="p-3 text-right">{op.proof ?? '—'}</td>
                        <td className="p-3 text-right">{Number(op.liters).toFixed(1)}</td>
                        <td className="p-3 text-right">{Number(op.proof_gallons).toFixed(1)}</td>
                      </tr>
                    ))}
                    {!loading && operations.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No operations recorded for this period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6"><p className="text-sm text-muted-foreground">Due by the 15th of the following month</p></CardFooter>
      </Card>
    </div>
  );
};

export default Report5110_11;
