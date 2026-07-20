
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
import { OperationType, literToProofGallon } from "@/lib/models";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { spiritsService } from "@/lib/supabase/spirits";
import { batchesService } from "@/lib/supabase/batches";
import { operationsService } from "@/lib/supabase/operations";
import type { Database } from "@/integrations/supabase/types";
import {
  PRODUCTION_SOURCES,
  TRANSFER_DESTINATIONS,
  LOSS_REASONS,
  KINDS_OF_SPIRIT,
  type ProductionSource,
  type TransferDestination,
  type LossReason,
  type KindOfSpirit,
} from "@/lib/ttb/classifications";

type Spirit = Database['public']['Tables']['spirits']['Row'];
type Batch = Database['public']['Tables']['batches']['Row'];
type Operation = Database['public']['Tables']['operations']['Row'];


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
  const { user } = useSupabaseAuth();
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
  const [productionSource, setProductionSource] = useState<ProductionSource | "">("");
  const [transferDestination, setTransferDestination] = useState<TransferDestination | "">("");
  const [lossReason, setLossReason] = useState<LossReason | "">("");
  const [kindOfSpirit, setKindOfSpirit] = useState<KindOfSpirit | "">("");
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOperation, setEditingOperation] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<string | null>(null);
  
  // For the operation log table
  const filteredOperations = operations
    .filter(op => 
      (filterType === "all" || op.type === filterType) &&
      (filterDate === undefined || format(new Date(op.operation_date), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd')) &&
      (searchTerm === "" || 
        op.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        op.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spirits.find(s => s.id === op.spirit_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.operation_date).getTime() - new Date(a.operation_date).getTime());
  
  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!user?.organization?.id) return;
      
      try {
        setLoading(true);
        const [spiritsData, batchesData, operationsData] = await Promise.all([
          spiritsService.getAll(user.organization.id),
          batchesService.getAll(user.organization.id),
          operationsService.getAll(user.organization.id)
        ]);
        
        setSpirits(spiritsData);
        setBatches(batchesData);
        setOperations(operationsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.organization?.id]);
  
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
    const spirit = spirits.find(s => s.id === value);
    if (spirit) {
      setProof(spirit.default_proof.toString());
    }
    setBatchId("");
  };
  
  const handleBatchChange = (value: string) => {
    setBatchId(value);
    if (value === "none" || value === "") return;
    
    const batch = batches.find(b => b.id === value);
    if (batch) {
      const spirit = spirits.find(s => s.id === batch.spirit_id);
      if (spirit) {
        setSpiritId(spirit.id);
      }
      setProof(batch.proof.toString());
    }
  };
  
  const handleLogOperation = async () => {
    if (!spiritId || !type || !liters || Number(liters) <= 0 || !user) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (type === 'production' && !productionSource) {
      toast.error("Select a production source (distillation or redistillation)");
      return;
    }
    if (type === 'transfer_out' && !transferDestination) {
      toast.error("Select a transfer destination");
      return;
    }
    if (type === 'loss' && !lossReason) {
      toast.error("Select a loss reason");
      return;
    }

    try {
      const newOperation = await operationsService.create({
        organization_id: user.organization.id,
        user_id: user.id,
        operator_id: user.id,
        operation_date: date.toISOString(),
        type,
        spirit_id: spiritId || null,
        batch_id: batchId && batchId !== "none" ? batchId : null,
        proof: Number(proof) || null,
        liters: Number(liters),
        proof_gallons: Number(proofGallons),
        bottles: type === 'bottling' ? Number(bottles) : null,
        bottle_size: type === 'bottling' ? bottleSize : null,
        destination_or_source: (type === 'transfer_in' || type === 'transfer_out') ? destination : null,
        production_source: type === 'production' ? productionSource : null,
        transfer_destination: type === 'transfer_out' ? transferDestination : null,
        loss_reason: type === 'loss' ? lossReason : null,
        kind_of_spirit: kindOfSpirit || null,
        notes: notes || null,
      });
      
      setOperations([newOperation, ...operations]);
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
      setProductionSource("");
      setTransferDestination("");
      setLossReason("");
      setKindOfSpirit("");
    } catch (error) {
      console.error('Error logging operation:', error);
      toast.error('Failed to log operation');
    }
  };
  
  const handleEditOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;
    
    setEditingOperation(operationId);
    setDate(new Date(operation.operation_date));
    setType(operation.type as OperationType);
    setSpiritId(operation.spirit_id || "");
    setBatchId(operation.batch_id || "");
    setProof(operation.proof?.toString() || "80");
    setLiters(operation.liters.toString());
    setProofGallons(operation.proof_gallons.toString());
    setBottles(operation.bottles?.toString() || "0");
    setBottleSize(operation.bottle_size || "750ml");
    setDestination(operation.destination_or_source || "");
    setNotes(operation.notes || "");
    setProductionSource((operation.production_source as ProductionSource) || "");
    setTransferDestination((operation.transfer_destination as TransferDestination) || "");
    setLossReason((operation.loss_reason as LossReason) || "");
    setKindOfSpirit((operation.kind_of_spirit as KindOfSpirit) || "");
    
    setIsEditDialogOpen(true);
  };
  
  const handleSaveEdit = async () => {
    if (!editingOperation || !spiritId || !type || !liters || Number(liters) <= 0 || !user) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (type === 'production' && !productionSource) {
      toast.error("Select a production source (distillation or redistillation)");
      return;
    }
    if (type === 'transfer_out' && !transferDestination) {
      toast.error("Select a transfer destination");
      return;
    }
    if (type === 'loss' && !lossReason) {
      toast.error("Select a loss reason");
      return;
    }
    
    try {
      const updatedOperation = await operationsService.update(editingOperation, {
        operation_date: date.toISOString(),
        type,
        spirit_id: spiritId || null,
        batch_id: batchId && batchId !== "none" ? batchId : null,
        proof: Number(proof) || null,
        liters: Number(liters),
        proof_gallons: Number(proofGallons),
        bottles: type === 'bottling' ? Number(bottles) : null,
        bottle_size: type === 'bottling' ? bottleSize : null,
        destination_or_source: (type === 'transfer_in' || type === 'transfer_out') ? destination : null,
        production_source: type === 'production' ? productionSource : null,
        transfer_destination: type === 'transfer_out' ? transferDestination : null,
        loss_reason: type === 'loss' ? lossReason : null,
        kind_of_spirit: kindOfSpirit || null,
        notes: notes || null,
      });
      
      setOperations(operations.map(op => op.id === editingOperation ? updatedOperation : op));
      toast.success("Operation updated successfully");
      
      // Reset form and close dialog
      resetForm();
      setIsEditDialogOpen(false);
      setEditingOperation(null);
    } catch (error) {
      console.error('Error updating operation:', error);
      toast.error('Failed to update operation');
    }
  };

  
  const handleDeletePrompt = (operationId: string) => {
    setOperationToDelete(operationId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!operationToDelete) return;
    
    try {
      await operationsService.delete(operationToDelete);
      setOperations(operations.filter(op => op.id !== operationToDelete));
      toast.success("Operation deleted successfully");
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setOperationToDelete(null);
    } catch (error) {
      console.error('Error deleting operation:', error);
      toast.error('Failed to delete operation');
    }
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
    setProductionSource("");
    setTransferDestination("");
    setLossReason("");
    setKindOfSpirit("");
    setEditingOperation(null);
  };

  
  const filteredBatches = batches.filter(batch => 
    spiritId ? batch.spirit_id === spiritId : true
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
                      {spirits.filter(s => s.active).map(spirit => (
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
                          {batch.batch_number}
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

                {type === 'production' && (
                  <div className="space-y-2">
                    <Label htmlFor="productionSource">Production source <span className="text-destructive">*</span></Label>
                    <Select value={productionSource} onValueChange={(v) => setProductionSource(v as ProductionSource)}>
                      <SelectTrigger id="productionSource"><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        {PRODUCTION_SOURCES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {type === 'transfer_out' && (
                  <div className="space-y-2">
                    <Label htmlFor="transferDestination">Transfer destination <span className="text-destructive">*</span></Label>
                    <Select value={transferDestination} onValueChange={(v) => setTransferDestination(v as TransferDestination)}>
                      <SelectTrigger id="transferDestination"><SelectValue placeholder="Select destination" /></SelectTrigger>
                      <SelectContent>
                        {TRANSFER_DESTINATIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {type === 'loss' && (
                  <div className="space-y-2">
                    <Label htmlFor="lossReason">Loss reason <span className="text-destructive">*</span></Label>
                    <Select value={lossReason} onValueChange={(v) => setLossReason(v as LossReason)}>
                      <SelectTrigger id="lossReason"><SelectValue placeholder="Select reason" /></SelectTrigger>
                      <SelectContent>
                        {LOSS_REASONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="kindOfSpirit">Kind of spirit (TTB column)</Label>
                  <Select value={kindOfSpirit} onValueChange={(v) => setKindOfSpirit(v as KindOfSpirit)}>
                    <SelectTrigger id="kindOfSpirit"><SelectValue placeholder="Select kind" /></SelectTrigger>
                    <SelectContent>
                      {KINDS_OF_SPIRIT.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>


                
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
                        const spirit = spirits.find(s => s.id === op.spirit_id);
                        const batch = batches.find(b => b.id === op.batch_id);
                        
                        return (
                          <tr key={op.id} className="border-b">
                            <td className="p-4">
                              {format(new Date(op.operation_date), "MMM d, yyyy")}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-1.5 rounded-full">
                                  {typeToIcon(op.type as OperationType)}
                                </div>
                                <span>{typeToLabel(op.type as OperationType)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{spirit?.name || 'Unknown'}</div>
                                {batch && (
                                  <div className="text-xs text-muted-foreground">
                                    Batch: {batch.batch_number}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">{op.proof}</td>
                            <td className="p-4">
                              {Number(op.liters).toFixed(1)} L
                              {op.bottles && (
                                <div className="text-xs text-muted-foreground">
                                  {op.bottles} × {op.bottle_size}
                                </div>
                              )}
                            </td>
                            <td className="p-4">{Number(op.proof_gallons).toFixed(1)}</td>
                            <td className="p-4">
                              {op.notes && (
                                <div className="text-xs max-w-[200px] truncate">
                                  {op.notes}
                                </div>
                              )}
                              {op.destination_or_source && (
                                <div className="text-xs text-muted-foreground">
                                  {op.type === 'transfer_in' ? 'From: ' : 'To: '}
                                  {op.destination_or_source}
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
                    {spirits.filter(s => s.active).map(spirit => (
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
                        {batch.batch_number}
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

            {type === 'production' && (
              <div className="space-y-2">
                <Label>Production source *</Label>
                <Select value={productionSource} onValueChange={(v) => setProductionSource(v as ProductionSource)}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    {PRODUCTION_SOURCES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {type === 'transfer_out' && (
              <div className="space-y-2">
                <Label>Transfer destination *</Label>
                <Select value={transferDestination} onValueChange={(v) => setTransferDestination(v as TransferDestination)}>
                  <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                  <SelectContent>
                    {TRANSFER_DESTINATIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {type === 'loss' && (
              <div className="space-y-2">
                <Label>Loss reason *</Label>
                <Select value={lossReason} onValueChange={(v) => setLossReason(v as LossReason)}>
                  <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>
                    {LOSS_REASONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Kind of spirit (TTB column)</Label>
              <Select value={kindOfSpirit} onValueChange={(v) => setKindOfSpirit(v as KindOfSpirit)}>
                <SelectTrigger><SelectValue placeholder="Select kind" /></SelectTrigger>
                <SelectContent>
                  {KINDS_OF_SPIRIT.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>


            
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
