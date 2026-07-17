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
import { getOrCreateReport, saveReportFields, Report5110_40Data } from "@/lib/reportData";
import { toast } from "@/components/ui/sonner";

type OpRow = {
  id: string;
  operation_date: string;
  type: string;
  spirit_id: string | null;
  batch_id: string | null;
  proof: number | null;
  liters: number;
  proof_gallons: number;
};

const Report5110_40 = () => {
  const { user } = useSupabaseAuth();
  const organizationId = user?.organization?.id;

  const [reportPeriod, setReportPeriod] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [reportData, setReportData] = useState<Report5110_40Data | null>(null);
  const [operations, setOperations] = useState<OpRow[]>([]);
  const [loading, setLoading] = useState(false);

  const startDate = startOfMonth(reportPeriod);
  const endDate = endOfMonth(reportPeriod);

  const loadReport = useCallback(async () => {
    if (!organizationId || !user) return;
    setLoading(true);
    try {
      const data = await getOrCreateReport<Report5110_40Data>(organizationId, user.id, '5110-40', reportPeriod);
      setReportData(data);

      const { data: ops, error } = await supabase
        .from('operations')
        .select('id, operation_date, type, spirit_id, batch_id, proof, liters, proof_gallons')
        .eq('organization_id', organizationId)
        .gte('operation_date', startDate.toISOString())
        .lte('operation_date', endDate.toISOString())
        .order('operation_date', { ascending: true });
      if (error) throw error;
      setOperations((ops ?? []) as OpRow[]);
    } catch (err: any) {
      console.error('[report 5110-40] load error', err);
      toast.error(err?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, user?.id, reportPeriod]);

  useEffect(() => { void loadReport(); }, [loadReport]);

  const updateReportField = async (field: keyof Report5110_40Data, value: any) => {
    if (!reportData || !organizationId || !user) return;
    const next = { ...reportData, [field]: value } as Report5110_40Data;
    setReportData(next);
    try {
      const saved = await saveReportFields<Report5110_40Data>(organizationId, user.id, '5110-40', reportPeriod, { [field]: value } as any);
      setReportData(saved);
    } catch (err: any) {
      console.error('[report 5110-40] save error', err);
      toast.error(err?.message || 'Failed to save report');
    }
  };

  const handleDownloadPDF = async () => {
    const fileName = `TTB_5110_40_${format(reportPeriod, "yyyy-MM")}.pdf`;
    try {
      const [{ generateTtbPdf, downloadPdf }, { form5110_40Definition }] = await Promise.all([
        import("@/lib/pdf/ttbPdfService"),
        import("@/lib/pdf/forms/f5110-40"),
      ]);
      // TEMP: hard-coded test values — foundation smoke test for field placement.
      const bytes = await generateTtbPdf(form5110_40Definition, {
        proprietorName: "TEST DISTILLERY LLC",
        monthAndYear: format(reportPeriod, "MMMM yyyy"),
        locationOfPlant: "123 Test St, Louisville, KY 40202",
        plantNumberDsp: "DSP-KY-20001",
      });
      downloadPdf(bytes, fileName);
      toast.success("Generated TTB Form 5110.40 (test values)", { description: fileName });
    } catch (err: any) {
      console.error("[report 5110-40] pdf error", err);
      toast.error(err?.message || "Failed to generate PDF");
    }
  };

  const handlePrintReport = () => {
    toast.success("Preparing TTB Form 5110.40 for printing");
    setTimeout(() => window.print(), 300);
  };

  const inv = reportData?.inventory;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form 5110.40</h1>
          <p className="text-muted-foreground">Monthly Report of Operations for Distilled Spirits Plants</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrintReport}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button variant="outline" onClick={handleDownloadPDF}><Download className="mr-2 h-4 w-4" />Download PDF</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" />Monthly Report of Operations (Form 5110.40)</CardTitle>
          <CardDescription>
            Reporting period: {format(reportPeriod, "MMMM yyyy")}
            {reportData && (<span className="ml-4 text-xs text-blue-600">Last updated: {format(reportData.updatedAt, "MM/dd/yyyy HH:mm:ss")}</span>)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="report">
            <TabsList className="mb-6">
              <TabsTrigger value="report">Report</TabsTrigger>
              <TabsTrigger value="info">Plant Information</TabsTrigger>
              <TabsTrigger value="operations">Operations Detail</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reportMonth">Reporting Period</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !reportPeriod && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reportPeriod ? format(reportPeriod, "MMMM yyyy") : "Select month"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto">
                      <Calendar mode="single" selected={reportPeriod} onSelect={(d) => d && setReportPeriod(startOfMonth(d))} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input id="registrationNumber" value={reportData?.registrationNumber || ""} onChange={(e) => updateReportField('registrationNumber', e.target.value)} placeholder="e.g., DSP-XX-12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proprietorName">Proprietor Name</Label>
                  <Input id="proprietorName" value={reportData?.proprietorName || ""} onChange={(e) => updateReportField('proprietorName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proprietorAddress">Plant Address</Label>
                  <Input id="proprietorAddress" value={reportData?.proprietorAddress || ""} onChange={(e) => updateReportField('proprietorAddress', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="einNumber">EIN Number</Label>
                  <Input id="einNumber" value={reportData?.einNumber || ""} onChange={(e) => updateReportField('einNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportData?.reportType || "original"} onValueChange={(value: 'original' | 'amended' | 'final') => updateReportField('reportType', value)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Part I - Summary of Spirits Activity</h3>
                <p className="text-sm text-muted-foreground mb-4">All figures are in proof gallons</p>
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
                      <tr className="border-b"><td className="p-3">2. Spirits produced</td><td className="p-3 text-right">{inv?.production.toFixed(1) ?? '0.0'}</td></tr>
                      <tr className="border-b"><td className="p-3">3. Spirits received (transfer in)</td><td className="p-3 text-right">{inv?.transferIn.toFixed(1) ?? '0.0'}</td></tr>
                      <tr className="border-b bg-muted/20"><td className="p-3 font-medium">4. Total spirits available (1+2+3)</td><td className="p-3 text-right font-medium">{inv ? (inv.beginningInventory + inv.production + inv.transferIn).toFixed(1) : '0.0'}</td></tr>
                      <tr className="border-b"><td className="p-3">5. Bottled</td><td className="p-3 text-right">{inv?.bottling.toFixed(1) ?? '0.0'}</td></tr>
                      <tr className="border-b"><td className="p-3">6. Transferred out</td><td className="p-3 text-right">{inv?.transferOut.toFixed(1) ?? '0.0'}</td></tr>
                      <tr className="border-b"><td className="p-3">7. Loss &amp; destruction</td><td className="p-3 text-right">{inv?.loss.toFixed(1) ?? '0.0'}</td></tr>
                      <tr className="border-b bg-muted/20"><td className="p-3 font-medium">8. Total spirits disposed of (5+6+7)</td><td className="p-3 text-right font-medium">{inv ? (inv.bottling + inv.transferOut + inv.loss).toFixed(1) : '0.0'}</td></tr>
                      <tr className="border-b bg-muted/50"><td className="p-3 font-bold">15. Ending inventory (4 - 8)</td><td className="p-3 text-right font-bold">{inv?.endingInventory.toFixed(1) ?? '0.0'}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="operations">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Operations Detail</h3>
                <p className="text-sm text-muted-foreground mb-4">Detailed list of operations for the reporting period</p>
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6"><p className="text-sm text-muted-foreground">Due by the 15th of the following month</p></CardFooter>
      </Card>
    </div>
  );
};

export default Report5110_40;
