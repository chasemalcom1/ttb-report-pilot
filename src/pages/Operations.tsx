
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  FilterIcon, 
  SearchIcon,
  Archive,
  Book,
  FileDown,
  FileUp,
  Info,
  Trash2,
  FlaskConical,
  Edit,
  Plus,
  X
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  MOCK_OPERATIONS, 
  MOCK_SPIRITS, 
  MOCK_BATCHES, 
  OperationType,
  literToProofGallon,
  addOperation,
  updateOperation,
  deleteOperation
} from "@/lib/models";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const typeToIcon = (type: OperationType) => {
  switch(type) {
    case 'production': return <FlaskConical className="h-5 w-5" />;
    case 'bottling': return <Archive className="h-5 w-5" />;
    case 'transfer_in': return <FileDown className="h-5 w-5" />;
    case 'transfer_out': return <FileUp className="h-5 w-5" />;
    case 'loss': return <Info className="h-5 w-5" />;
    case 'redistillation': return <FlaskConical className="h-5 w-5" />;
    case 'tax_withdrawal': return <FileUp className="h-5 w-5" />;
    default: return <Book className="h-5 w-5" />;
  }
};

const typeToLabel = (type: OperationType) => {
  switch(type) {
    case 'production': return 'Production';
    case 'bottling': return 'Bottling';
    case 'transfer_in': return 'Transfer In';
    case 'transfer_out': return 'Transfer Out';
    case 'loss': return 'Loss';
    case 'addition': return 'Addition';
    case 'redistillation': return 'Redistillation';
    case 'tax_withdrawal': return 'Tax Withdrawal';
    default: return type;
  }
};

const Operations = () => {
  const [searchParams] = useSearchParams();
  const initialBatchId = searchParams.get('batchId');
  
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<OperationType>('production');
  const [spiritId, setSpiritId] = useState<string>("");
  const [batchId, setBatchId] = useState<string>(initialBatchId || "");
  const [proof, setProof] = useState<string>("80");
  const [liters, setLiters] = useState<string>("0");
  const [proofGallons, setProofGallons] = useState<string>("0");
  const [bottles, setBottles] = useState<string>("0");
  const [bottleSize, setBottleSize] = useState<string>("750ml");
  const [destination, setDestination] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  
  const [operations, setOperations] = useState([...MOCK_OPERATIONS]);
  const [editingOperation, setEditingOperation] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<string | null>(null);
  
  // For the operation log table
  const filteredOperations = operations
    .filter(op => 
      (filterType === "all" || op.type === filterType) &&
      (filterDate === undefined || format(op.date, 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd')) &&
      (searchTerm === "" || 
        op.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        op.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        MOCK_SPIRITS.find(s => s.id === op.spiritId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Load operations when component mounts
  useEffect(() => {
    setOperations([...MOCK_OPERATIONS]);
  }, []);
  
  const handleLitersChange = (value: string) => {
    setLiters(value);
    if (value && proof) {
      const calculatedProofGallons = literToProofGallon(Number(value), Number(proof));
      setProofGallons(calculatedProofGallons.toString());
    }
  };
  
  const handleProofChange = (value: string) => {
    setProof(value);
    if (liters && value) {
      const calculatedProofGallons = literToProofGallon(Number(liters), Number(value));
      setProofGallons(calculatedProofGallons.toString());
    }
  };
  
  const handleSpiritChange = (value: string) => {
    setSpiritId(value);
    const spirit = MOCK_SPIRITS.find(s => s.id === value);
    if (spirit) {
      setProof(spirit.defaultProof.toString());
    }
    setBatchId("");
  };
  
  const handleBatchChange = (value: string) => {
    setBatchId(value);
    if (value === "none" || value === "") return;
    
    const batch = MOCK_BATCHES.find(b => b.id === value);
    if (batch) {
      const spirit = MOCK_SPIRITS.find(s => s.id === batch.spiritId);
      if (spirit) {
        setSpiritId(spirit.id);
      }
      setProof(batch.proof.toString());
    }
  };
  
  const handleLogOperation = () => {
    if (!spiritId || !type || !liters || Number(liters) <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const newOperation = {
      id: `temp-${Date.now()}`,
      type,
      date,
      spiritId,
      batchId: batchId && batchId !== "none" ? batchId : undefined,
      proof: Number(proof),
      liters: Number(liters),
      proofGallons: Number(proofGallons),
      bottles: type === 'bottling' ? Number(bottles) : undefined,
      bottleSize: type === 'bottling' ? bottleSize : undefined,
      destinationOrSource: (type === 'transfer_in' || type === 'transfer_out') ? destination : undefined,
      notes,
      operatorId: '1', // Mocked user ID
      createdAt: new Date(),
    };
    
    // Add to model and local storage
    addOperation(newOperation);
    
    // Update local state
    setOperations([...MOCK_OPERATIONS]);
    
    toast.success("Operation logged successfully");
    
    // Reset form fields
    setType('production');
    setSpiritId("");
    setBatchId("");
    setProof("80");
    setLiters("0");
    setProofGallons("0");
    setBottles("0");
    setDestination("");
    setNotes("");
  };
  
  const handleEditOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;
    
    setEditingOperation(operationId);
    setDate(operation.date);
    setType(operation.type);
    setSpiritId(operation.spiritId || "");
    setBatchId(operation.batchId || "");
    setProof(operation.proof?.toString() || "80");
    setLiters(operation.liters.toString());
    setProofGallons(operation.proofGallons.toString());
    setBottles(operation.bottles?.toString() || "0");
    setBottleSize(operation.bottleSize || "750ml");
    setDestination(operation.destinationOrSource || "");
    setNotes(operation.notes || "");
    
    setIsEditDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (!editingOperation || !spiritId || !type || !liters || Number(liters) <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const updatedOperation = {
      id: editingOperation,
      type,
      date,
      spiritId,
      batchId: batchId && batchId !== "none" ? batchId : undefined,
      proof: Number(proof),
      liters: Number(liters),
      proofGallons: Number(proofGallons),
      bottles: type === 'bottling' ? Number(bottles) : undefined,
      bottleSize: type === 'bottling' ? bottleSize : undefined,
      destinationOrSource: (type === 'transfer_in' || type === 'transfer_out') ? destination : undefined,
      notes,
      operatorId: '1', // Mocked user ID
      createdAt: new Date(),
    };
    
    // Update operation in model and local storage
    updateOperation(updatedOperation);
    
    // Update local state
    setOperations([...MOCK_OPERATIONS]);
    
    toast.success("Operation updated successfully");
    
    // Reset form and close dialog
    resetForm();
    setIsEditDialogOpen(false);
    setEditingOperation(null);
  };
  
  const handleDeletePrompt = (operationId: string) => {
    setOperationToDelete(operationId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (!operationToDelete) return;
    
    // Delete operation from model and local storage
    deleteOperation(operationToDelete);
    
    // Update local state
    setOperations([...MOCK_OPERATIONS]);
    
    toast.success("Operation deleted successfully");
    
    // Close dialog
    setIsDeleteDialogOpen(false);
    setOperationToDelete(null);
  };
  
  const resetForm = () => {
    setDate(new Date());
    setType('production');
    setSpiritId("");
    setBatchId("");
    setProof("80");
    setLiters("0");
    setProofGallons("0");
    setBottles("0");
    setBottleSize("750ml");
    setDestination("");
    setNotes("");
    setEditingOperation(null);
  };
  
  const filteredBatches = MOCK_BATCHES.filter(batch => 
    spiritId ? batch.spiritId === spiritId : true
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operations Log</h1>
        <p className="text-muted-foreground">
          Record and manage your daily operations
        </p>
      </div>
      
      <Tabs defaultValue="log" className="space-y-6">
        <TabsList>
          <TabsTrigger value="log">Log New Operation</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Log New Operation</CardTitle>
              <CardDescription>
                Record production runs, bottling, transfers, losses, or other operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "MMMM d, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 pointer-events-auto">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Operation Type</Label>
                  <Select value={type} onValueChange={(value) => setType(value as OperationType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="bottling">Bottling</SelectItem>
                      <SelectItem value="transfer_in">Transfer In</SelectItem>
                      <SelectItem value="transfer_out">Transfer Out</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                      <SelectItem value="addition">Addition</SelectItem>
                      <SelectItem value="redistillation">Redistillation</SelectItem>
                      <SelectItem value="tax_withdrawal">Tax Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="spirit">Spirit</Label>
                  <Select value={spiritId} onValueChange={handleSpiritChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select spirit" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_SPIRITS.map(spirit => (
                        <SelectItem key={spirit.id} value={spirit.id}>
                          {spirit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch (Optional)</Label>
                  <Select value={batchId} onValueChange={handleBatchChange} disabled={!spiritId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Create New)</SelectItem>
                      {filteredBatches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batchNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proof">Proof</Label>
                  <Input 
                    id="proof" 
                    type="number"
                    value={proof} 
                    onChange={(e) => handleProofChange(e.target.value)}
                    min="0"
                    max="200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="liters">Liters</Label>
                  <Input 
                    id="liters" 
                    type="number"
                    value={liters} 
                    onChange={(e) => handleLitersChange(e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proofGallons">Proof Gallons (Calculated)</Label>
                  <Input
                    id="proofGallons"
                    value={proofGallons}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                {type === 'bottling' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bottles">Number of Bottles</Label>
                      <Input
                        id="bottles"
                        type="number"
                        value={bottles}
                        onChange={(e) => setBottles(e.target.value)}
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bottleSize">Bottle Size</Label>
                      <Select value={bottleSize} onValueChange={setBottleSize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50ml">50ml (Mini)</SelectItem>
                          <SelectItem value="375ml">375ml (Half)</SelectItem>
                          <SelectItem value="750ml">750ml (Standard)</SelectItem>
                          <SelectItem value="1L">1 Liter</SelectItem>
                          <SelectItem value="1.75L">1.75 Liter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {(type === 'transfer_in' || type === 'transfer_out') && (
                  <div className="space-y-2">
                    <Label htmlFor="destination">
                      {type === 'transfer_in' ? 'Source' : 'Destination'}
                    </Label>
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder={
                        type === 'transfer_in' 
                          ? 'Where is this coming from?' 
                          : 'Where is this going to?'
                      }
                    />
                  </div>
                )}
                
                <div className="space-y-2 sm:col-span-2 md:col-span-3">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional details about this operation"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  type="button" 
                  onClick={handleLogOperation}
                  disabled={!spiritId || Number(liters) <= 0}
                >
                  Log Operation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation History</CardTitle>
              <CardDescription>
                View and filter past operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search operations..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-row gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Operations</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="bottling">Bottling</SelectItem>
                      <SelectItem value="transfer_in">Transfer In</SelectItem>
                      <SelectItem value="transfer_out">Transfer Out</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {filterDate ? format(filterDate, "MMM d") : "Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 pointer-events-auto">
                      <Calendar
                        mode="single"
                        selected={filterDate}
                        onSelect={setFilterDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                      {filterDate && (
                        <div className="flex items-center justify-center p-2 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setFilterDate(undefined)}
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="border rounded-md">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Date</th>
                      <th className="h-10 px-4 text-left font-medium">Type</th>
                      <th className="h-10 px-4 text-left font-medium">Spirit/Batch</th>
                      <th className="h-10 px-4 text-left font-medium">Proof</th>
                      <th className="h-10 px-4 text-left font-medium">Volume</th>
                      <th className="h-10 px-4 text-left font-medium">PG</th>
                      <th className="h-10 px-4 text-left font-medium">Details</th>
                      <th className="h-10 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOperations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="h-24 text-center text-muted-foreground">
                          No operations found
                        </td>
                      </tr>
                    ) : (
                      filteredOperations.map((op) => {
                        const spirit = MOCK_SPIRITS.find(s => s.id === op.spiritId);
                        const batch = MOCK_BATCHES.find(b => b.id === op.batchId);
                        
                        return (
                          <tr key={op.id} className="border-b">
                            <td className="p-4">
                              {format(op.date, "MMM d, yyyy")}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-1.5 rounded-full">
                                  {typeToIcon(op.type)}
                                </div>
                                <span>{typeToLabel(op.type)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{spirit?.name || 'Unknown'}</div>
                                {batch && (
                                  <div className="text-xs text-muted-foreground">
                                    Batch: {batch.batchNumber}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">{op.proof}</td>
                            <td className="p-4">
                              {op.liters.toFixed(1)} L
                              {op.bottles && (
                                <div className="text-xs text-muted-foreground">
                                  {op.bottles} × {op.bottleSize}
                                </div>
                              )}
                            </td>
                            <td className="p-4">{op.proofGallons.toFixed(1)}</td>
                            <td className="p-4">
                              {op.notes && (
                                <div className="text-xs max-w-[200px] truncate">
                                  {op.notes}
                                </div>
                              )}
                              {op.destinationOrSource && (
                                <div className="text-xs text-muted-foreground">
                                  {op.type === 'transfer_in' ? 'From: ' : 'To: '}
                                  {op.destinationOrSource}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleEditOperation(op.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="text-destructive"
                                  onClick={() => handleDeletePrompt(op.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Operation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Operation</DialogTitle>
            <DialogDescription>
              Update the details of this operation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "MMMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as OperationType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="bottling">Bottling</SelectItem>
                    <SelectItem value="transfer_in">Transfer In</SelectItem>
                    <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="addition">Addition</SelectItem>
                    <SelectItem value="redistillation">Redistillation</SelectItem>
                    <SelectItem value="tax_withdrawal">Tax Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-spirit">Spirit</Label>
                <Select value={spiritId} onValueChange={handleSpiritChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select spirit" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_SPIRITS.map(spirit => (
                      <SelectItem key={spirit.id} value={spirit.id}>
                        {spirit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-batch">Batch</Label>
                <Select value={batchId} onValueChange={handleBatchChange} disabled={!spiritId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {filteredBatches.map(batch => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batchNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-proof">Proof</Label>
                <Input 
                  id="edit-proof" 
                  type="number"
                  value={proof} 
                  onChange={(e) => handleProofChange(e.target.value)}
                  min="0"
                  max="200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-liters">Liters</Label>
                <Input 
                  id="edit-liters" 
                  type="number"
                  value={liters} 
                  onChange={(e) => handleLitersChange(e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-proof-gallons">Proof Gallons</Label>
                <Input
                  id="edit-proof-gallons"
                  value={proofGallons}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
            
            {type === 'bottling' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bottles">Number of Bottles</Label>
                  <Input
                    id="edit-bottles"
                    type="number"
                    value={bottles}
                    onChange={(e) => setBottles(e.target.value)}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-bottle-size">Bottle Size</Label>
                  <Select value={bottleSize} onValueChange={setBottleSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50ml">50ml (Mini)</SelectItem>
                      <SelectItem value="375ml">375ml (Half)</SelectItem>
                      <SelectItem value="750ml">750ml (Standard)</SelectItem>
                      <SelectItem value="1L">1 Liter</SelectItem>
                      <SelectItem value="1.75L">1.75 Liter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {(type === 'transfer_in' || type === 'transfer_out') && (
              <div className="space-y-2">
                <Label htmlFor="edit-destination">
                  {type === 'transfer_in' ? 'Source' : 'Destination'}
                </Label>
                <Input
                  id="edit-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={type === 'transfer_in' ? 'Where is this coming from?' : 'Where is this going to?'}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional details about this operation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this operation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Operations;
