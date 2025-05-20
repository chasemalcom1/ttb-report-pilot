import { useState, useEffect } from "react";
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
import { 
  MOCK_OPERATIONS
} from "@/lib/models";
import { calculateInventory } from "@/lib/reportUtils";
import { toast } from "@/components/ui/sonner";

const Report5110_11 = () => {
  const [reportPeriod, setReportPeriod] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [registrationNumber, setRegistrationNumber] = useState("DSP-NY-12345");
  const [proprietorName, setProprietorName] = useState("Mountain Spirits Distillery");
  const [proprietorAddress, setProprietorAddress] = useState("123 Main St, Springfield, NY 12345");
  const [einNumber, setEinNumber] = useState("XX-XXXXXXX");
  const [inventory, setInventory] = useState({
    beginningInventory: 310.2,
    production: 0,
    transferIn: 0,
    bottling: 0,
    taxWithdrawal: 0,
    transferOut: 0,
    loss: 1.8,
    endingInventory: 0
  });
  
  // Create date range for the selected month
  const startDate = startOfMonth(reportPeriod);
  const endDate = endOfMonth(reportPeriod);
  
  // Update inventory calculations when operations or report period changes
  useEffect(() => {
    const calculatedInventory = calculateInventory(startDate, endDate, 310.2);
    setInventory(calculatedInventory);
  }, [reportPeriod, MOCK_OPERATIONS, startDate, endDate]);
  
  // Generate PDF content for download
  const generatePDFContent = () => {
    // In a real app, this would create a proper PDF
    // For now, we'll generate a data URL with minimal content
    const content = `
      TTB FORM 5110.11 - Monthly Report of Storage Operations
      
      Period: ${format(reportPeriod, "MMMM yyyy")}
      Registration Number: ${registrationNumber}
      Proprietor: ${proprietorName}
      Address: ${proprietorAddress}
      
      Summary:
      - Beginning Inventory: ${inventory.beginningInventory.toFixed(1)} proof gallons
      - Deposited in storage: ${inventory.production.toFixed(1)} proof gallons
      - Received in storage: ${inventory.transferIn.toFixed(1)} proof gallons
      - Withdrawn from storage: ${inventory.bottling.toFixed(1)} proof gallons
      - Loss in storage: ${inventory.loss.toFixed(1)} proof gallons
      - Ending inventory: ${inventory.endingInventory.toFixed(1)} proof gallons
    `;
    
    // Convert to data URL for download (in a real app, this would be a PDF)
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
  };
  
  const handleDownloadPDF = () => {
    // Generate PDF file name
    const fileName = `TTB_5110_11_${format(reportPeriod, "yyyy-MM")}.txt`;
    
    toast.success("Downloading TTB Form 5110.11", {
      description: `Downloading ${fileName}`
    });
    
    // Create an actual download link
    const dataUrl = generatePDFContent();
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download complete!", {
      description: `${fileName} has been downloaded to your computer`
    });
  };
  
  const handlePrintReport = () => {
    toast.success("Preparing TTB Form 5110.11 for printing", {
      description: "Opening print dialog..."
    });
    
    // Store current document content
    const originalContent = document.body.innerHTML;
    
    // Create printable content
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center;">TTB FORM 5110.11</h1>
        <h2 style="text-align: center;">Monthly Report of Storage Operations</h2>
        
        <div style="margin: 20px 0;">
          <p><strong>Period:</strong> ${format(reportPeriod, "MMMM yyyy")}</p>
          <p><strong>Registration Number:</strong> ${registrationNumber}</p>
          <p><strong>Proprietor:</strong> ${proprietorName}</p>
          <p><strong>Address:</strong> ${proprietorAddress}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Proof Gallons</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">1. Beginning inventory</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${inventory.beginningInventory.toFixed(1)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">2. Deposited in storage</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${inventory.production.toFixed(1)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">3. Received in storage</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${inventory.transferIn.toFixed(1)}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>4. Total (Lines 1, 2 & 3)</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>${(inventory.beginningInventory + inventory.production + inventory.transferIn).toFixed(1)}</strong></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">5. Withdrawn from storage</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${inventory.bottling.toFixed(1)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">6. Loss in storage</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${inventory.loss.toFixed(1)}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>7. Total removed (Lines 5 & 6)</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>${(inventory.bottling + inventory.loss).toFixed(1)}</strong></td>
            </tr>
            <tr style="background-color: #e6e6e6;">
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>8. Ending inventory (Line 4 minus Line 7)</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>${inventory.endingInventory.toFixed(1)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    
    // Replace document content for printing
    document.body.innerHTML = printContent;
    
    // Print
    setTimeout(() => {
      window.print();
      
      // Restore original content
      document.body.innerHTML = originalContent;
      
      // Force page reload to properly restore all handlers after print
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form 5110.11</h1>
          <p className="text-muted-foreground">
            Monthly Report of Storage Operations
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
            Monthly Report of Storage Operations (Form 5110.11)
          </CardTitle>
          <CardDescription>
            Reporting period: {format(reportPeriod, "MMMM yyyy")}
          </CardDescription>
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
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g., DSP-XX-12345"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proprietorName">Proprietor Name</Label>
                  <Input
                    id="proprietorName"
                    value={proprietorName}
                    onChange={(e) => setProprietorName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proprietorAddress">Storage Facility Address</Label>
                  <Input
                    id="proprietorAddress"
                    value={proprietorAddress}
                    onChange={(e) => setProprietorAddress(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="einNumber">EIN Number</Label>
                  <Input
                    id="einNumber"
                    value={einNumber}
                    onChange={(e) => setEinNumber(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select defaultValue="original">
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
                <h3 className="text-lg font-medium mb-2">Part I - Storage Operations</h3>
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
                            Spirits in storage beginning of month
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={inventory.beginningInventory.toFixed(1)}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">2. Deposited in storage</div>
                          <div className="text-xs text-muted-foreground">
                            From production/other sources
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={inventory.production.toFixed(1)}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">3. Received in storage</div>
                          <div className="text-xs text-muted-foreground">
                            Received from other facilities
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={inventory.transferIn.toFixed(1)}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b bg-muted/20">
                        <td className="p-3 font-medium">
                          4. Total (Lines 1, 2 & 3)
                        </td>
                        <td className="p-3 text-right font-medium">
                          {(inventory.beginningInventory + inventory.production + inventory.transferIn).toFixed(1)}
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">5. Withdrawn from storage</div>
                          <div className="text-xs text-muted-foreground">
                            For processing/bottling
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={inventory.bottling.toFixed(1)}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3">
                          <div className="font-medium">6. Loss in storage</div>
                          <div className="text-xs text-muted-foreground">
                            Evaporation & shrinkage
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Input 
                            value={inventory.loss.toFixed(1)}
                            readOnly
                            className="text-right w-28 bg-muted inline-block"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b bg-muted/20">
                        <td className="p-3 font-medium">
                          7. Total removed (Lines 5 & 6)
                        </td>
                        <td className="p-3 text-right font-medium">
                          {(inventory.bottling + inventory.loss).toFixed(1)}
                        </td>
                      </tr>
                      
                      <tr className="border-b bg-muted/50">
                        <td className="p-3 font-bold">
                          8. Ending inventory (Line 4 minus Line 7)
                        </td>
                        <td className="p-3 text-right font-bold">
                          {inventory.endingInventory.toFixed(1)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

export default Report5110_11;
