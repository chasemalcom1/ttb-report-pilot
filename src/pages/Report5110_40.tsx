import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import CalendarIcon from "@/components/icons/CalendarIcon";
import { Download, FileText, Printer } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { MOCK_OPERATIONS } from "@/lib/models";
import { 
  getOrCreateReport, 
  saveReport, 
  refreshReportInventory,
  Report5110_40Data
} from "@/lib/reportData";
import { useOperationUpdates } from "@/lib/operationSubscription";
import { toast } from "@/components/ui/sonner";

const Report5110_40 = () => {
  const [reportPeriod, setReportPeriod] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [reportData, setReportData] = useState<Report5110_40Data | null>(null);
  
  // Create date range for the selected month
  const startDate = startOfMonth(reportPeriod);
  const endDate = endOfMonth(reportPeriod);
  
  // Load or create report data
  const loadReportData = () => {
    const data = getOrCreateReport<Report5110_40Data>('5110-40', reportPeriod);
    setReportData(data);
  };
  
  // Update report data when period changes
  useEffect(() => {
    loadReportData();
  }, [reportPeriod]);
  
  // Subscribe to operation updates and refresh inventory
  const refreshData = () => {
    if (reportData) {
      const refreshedData = refreshReportInventory<Report5110_40Data>('5110-40', reportPeriod);
      setReportData(refreshedData);
    }
  };
  
  useOperationUpdates(refreshData);
  
  // Save report data changes
  const updateReportField = (field: keyof Report5110_40Data, value: any) => {
    if (!reportData) return;
    
    const updatedData = { ...reportData, [field]: value };
    setReportData(updatedData);
    saveReport(updatedData);
  };
  
  const handleDownloadPDF = () => {
    // Generate PDF file name
    const fileName = `TTB_5110_40_${format(reportPeriod, "yyyy-MM")}.pdf`;
    
    toast.success("Downloading TTB Form 5110.40", {
      description: `Downloading ${fileName}`
    });
    
    // In a real implementation, this would generate and download the PDF
    setTimeout(() => {
      const link = document.createElement("a");
      // This would be a real PDF URL in production
      link.href = "#";
      link.download = fileName;
      document.body.appendChild(link);
      // Simulate download
      toast.info("Download complete!");
      document.body.removeChild(link);
    }, 1500);
  };
  
  const handlePrintReport = () => {
    toast.success("Preparing TTB Form 5110.40 for printing", {
      description: "Opening print dialog..."
    });
    // In a real implementation, this would open the print dialog with formatted content
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form 5110.40</h1>
          <p className="text-muted-foreground">
            Monthly Report of Operations for Distilled Spirits Plants
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrintReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Monthly Report of Operations (Form 5110.40)
          </CardTitle>
          <CardDescription>
            Reporting period: {format(reportPeriod, "MMMM yyyy")}
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
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reportPeriod && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reportPeriod ? format(reportPeriod, "MMMM yyyy") : "Select month"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto">
                      <Calendar
                        mode="single"
                        selected={reportPeriod}
                        onSelect={(date) => date && setReportPeriod(startOfMonth(date))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={reportData?.registrationNumber || ""}
                    onChange={(e) => updateReportField('registrationNumber', e.target.value)}
                    placeholder="e.g., DSP-XX-12345"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proprietorName">Proprietor Name</Label>
                  <Input
                    id="proprietorName"
                    value={reportData?.proprietorName || ""}
                    onChange={(e) => updateReportField('proprietorName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proprietorAddress">Plant Address</Label>
                  <Input
                    id="proprietorAddress"
                    value={reportData?.proprietorAddress || ""}
                    onChange={(e) => updateReportField('proprietorAddress', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="einNumber">EIN Number</Label>
                  <Input
                    id="einNumber"
                    value={reportData?.einNumber || ""}
                    onChange={(e) => updateReportField('einNumber', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select 
                    value={reportData?.reportType || "original"}
                    onValueChange={(value: 'original' | 'amended' | 'final') => 
                      updateReportField('reportType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
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
                <p className="text-sm text-muted-foreground mb-4">
                  All figures are in proof gallons
                </p>
                
                <div className="border rounded-md p-0 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">Description</th>
                        <th className="text-right p-3 w-48">Proof Gallons</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">1. Beginning inventory</div>
                          <div className="text-xs text-muted-foreground">
                            On hand beginning of month
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={reportData?.inventory.beginningInventory.toFixed(1) || "0.0"}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">2. Spirits produced</div>
                          <div className="text-xs text-muted-foreground">
                            Total production (from operations log)
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={reportData?.inventory.production.toFixed(1) || "0.0"}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">3. Spirits received</div>
                          <div className="text-xs text-muted-foreground">
                            Received from other plants
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={reportData?.inventory.transferIn.toFixed(1) || "0.0"}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b bg-muted/20">
                        <td className="p-3 font-medium">
                          4. Total spirits available
                        </td>
                        <td className="p-3 text-right font-medium">
                          {reportData ? (reportData.inventory.beginningInventory + reportData.inventory.production + reportData.inventory.transferIn).toFixed(1) : "0.0"}
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">5. Bottled</div>
                          <div className="text-xs text-muted-foreground">
                            Total bottled this month
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={reportData?.inventory.bottling.toFixed(1) || "0.0"}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">6. Transferred out</div>
                          <div className="text-xs text-muted-foreground">
                            Transferred to other plants
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={reportData?.inventory.transferOut.toFixed(1) || "0.0"}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">7. Loss & Destruction</div>
                          <div className="text-xs text-muted-foreground">
                            Documented loss (normal & abnormal)
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={reportData?.inventory.loss.toFixed(1) || "0.0"}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b bg-muted/20">
                        <td className="p-3 font-medium">
                          8. Total spirits disposed of
                        </td>
                        <td className="p-3 text-right font-medium">
                          {reportData ? (reportData.inventory.bottling + reportData.inventory.transferOut + reportData.inventory.loss).toFixed(1) : "0.0"}
                        </td>
                      </tr>
                      
                      <tr className="border-b bg-muted/50">
                        <td className="p-3 font-bold">
                          9. Ending inventory
                        </td>
                        <td className="p-3 text-right font-bold">
                          {reportData?.inventory.endingInventory.toFixed(1) || "0.0"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Certification</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Under penalties of perjury, I declare that I have examined this report and 
                  accompanying documents, and to the best of my knowledge and belief, they 
                  are true, correct, and complete.
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="signerName">Signer Name</Label>
                    <Input
                      id="signerName"
                      placeholder="Name of authorized signer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signerTitle">Signer Title</Label>
                    <Input
                      id="signerTitle"
                      placeholder="Title of authorized signer"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="operations">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Operations Detail</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed list of operations for the reporting period
                </p>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Spirit</th>
                        <th className="p-3 text-left">Batch</th>
                        <th className="p-3 text-right">Proof</th>
                        <th className="p-3 text-right">Liters</th>
                        <th className="p-3 text-right">Proof Gallons</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_OPERATIONS
                        .filter(op => op.date >= startDate && op.date <= endDate)
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .map(op => (
                          <tr key={op.id} className="border-b">
                            <td className="p-3">{format(op.date, "MM/dd/yyyy")}</td>
                            <td className="p-3 capitalize">{op.type.replace('_', ' ')}</td>
                            <td className="p-3">Spirit ID: {op.spiritId}</td>
                            <td className="p-3">{op.batchId ? `Batch ID: ${op.batchId}` : 'N/A'}</td>
                            <td className="p-3 text-right">{op.proof}</td>
                            <td className="p-3 text-right">{op.liters.toFixed(1)}</td>
                            <td className="p-3 text-right">{op.proofGallons.toFixed(1)}</td>
                          </tr>
                        ))}
                      {MOCK_OPERATIONS.filter(op => op.date >= startDate && op.date <= endDate).length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-muted-foreground">
                            No operations recorded for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Due by the 15th of the following month
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Report5110_40;
