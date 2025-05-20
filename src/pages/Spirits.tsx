
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MOCK_SPIRITS, 
  MOCK_BATCHES, 
  SpiritType,
  literToProofGallon,
  addSpirit,
  updateSpirit,
  deleteSpirit,
  addBatch,
  updateBatch,
  deleteBatch
} from "@/lib/models";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Spirits = () => {
  // Spirit form state
  const [newSpiritOpen, setNewSpiritOpen] = useState(false);
  const [spiritName, setSpiritName] = useState("");
  const [spiritType, setSpiritType] = useState<SpiritType>("whiskey");
  const [spiritProof, setSpiritProof] = useState("80");
  const [spiritDescription, setSpiritDescription] = useState("");
  const [editingSpiritId, setEditingSpiritId] = useState<string | null>(null);
  
  // Batch form state
  const [newBatchOpen, setNewBatchOpen] = useState(false);
  const [batchSpiritId, setBatchSpiritId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [batchProof, setBatchProof] = useState("80");
  const [batchDate, setBatchDate] = useState<Date>(new Date());
  const [batchLiters, setBatchLiters] = useState("0");
  const [batchProofGallons, setBatchProofGallons] = useState("0");
  const [batchNotes, setBatchNotes] = useState("");
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  
  // Delete confirmation dialogs
  const [spiritToDelete, setSpiritToDelete] = useState<string | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  const [deleteSpiritDialogOpen, setDeleteSpiritDialogOpen] = useState(false);
  const [deleteBatchDialogOpen, setDeleteBatchDialogOpen] = useState(false);
  
  // Display state
  const [selectedSpiritId, setSelectedSpiritId] = useState<string | null>(null);
  const [spirits, setSpirits] = useState([...MOCK_SPIRITS]);
  const [batches, setBatches] = useState([...MOCK_BATCHES]);
  
  // Refresh data when component mounts or after adding items
  useEffect(() => {
    setSpirits([...MOCK_SPIRITS]);
    setBatches([...MOCK_BATCHES]);
  }, []);
  
  // Filter batches if a spirit is selected
  const filteredBatches = batches.filter(batch => 
    selectedSpiritId ? batch.spiritId === selectedSpiritId : true
  );
  
  const handleBatchLitersChange = (value: string) => {
    setBatchLiters(value);
    if (value && batchProof) {
      const calculatedProofGallons = literToProofGallon(Number(value), Number(batchProof));
      setBatchProofGallons(calculatedProofGallons.toString());
    }
  };
  
  const handleBatchProofChange = (value: string) => {
    setBatchProof(value);
    if (batchLiters && value) {
      const calculatedProofGallons = literToProofGallon(Number(batchLiters), Number(value));
      setBatchProofGallons(calculatedProofGallons.toString());
    }
  };
  
  const handleAddSpirit = () => {
    if (!spiritName || !spiritType || !spiritProof) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const newSpirit = {
      id: editingSpiritId || `spirit-${Date.now()}`,
      name: spiritName,
      type: spiritType,
      defaultProof: Number(spiritProof),
      description: spiritDescription,
      active: true,
      createdAt: editingSpiritId ? MOCK_SPIRITS.find(s => s.id === editingSpiritId)!.createdAt : new Date(),
    };
    
    if (editingSpiritId) {
      // Update existing spirit
      updateSpirit(newSpirit);
      toast.success(`Spirit "${spiritName}" updated successfully`);
    } else {
      // Add new spirit
      addSpirit(newSpirit);
      toast.success(`Spirit "${spiritName}" added successfully`);
    }
    
    // Update local state
    setSpirits([...MOCK_SPIRITS]);
    
    // Reset form and close dialog
    resetSpiritForm();
    setNewSpiritOpen(false);
  };
  
  const handleEditSpirit = (spiritId: string) => {
    const spirit = spirits.find(s => s.id === spiritId);
    if (!spirit) return;
    
    setEditingSpiritId(spiritId);
    setSpiritName(spirit.name);
    setSpiritType(spirit.type);
    setSpiritProof(spirit.defaultProof.toString());
    setSpiritDescription(spirit.description || "");
    
    setNewSpiritOpen(true);
  };
  
  const handleDeleteSpiritPrompt = (spiritId: string) => {
    setSpiritToDelete(spiritId);
    setDeleteSpiritDialogOpen(true);
  };
  
  const handleDeleteSpiritConfirm = () => {
    if (!spiritToDelete) return;
    
    deleteSpirit(spiritToDelete);
    setSpirits([...MOCK_SPIRITS]);
    toast.success("Spirit deleted successfully");
    
    setDeleteSpiritDialogOpen(false);
    setSpiritToDelete(null);
  };
  
  const handleAddBatch = () => {
    if (!batchSpiritId || !batchNumber || !batchProof || !batchLiters) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const newBatch = {
      id: editingBatchId || `batch-${Date.now()}`,
      spiritId: batchSpiritId,
      batchNumber,
      productionDate: batchDate,
      proof: Number(batchProof),
      originalLiters: editingBatchId ? 
        MOCK_BATCHES.find(b => b.id === editingBatchId)!.originalLiters : 
        Number(batchLiters),
      currentLiters: Number(batchLiters),
      status: 'in_production' as const,
      notes: batchNotes,
      createdAt: editingBatchId ? 
        MOCK_BATCHES.find(b => b.id === editingBatchId)!.createdAt : 
        new Date(),
    };
    
    if (editingBatchId) {
      // Update existing batch
      updateBatch(newBatch);
      toast.success(`Batch "${batchNumber}" updated successfully`);
    } else {
      // Add new batch
      addBatch(newBatch);
      toast.success(`Batch "${batchNumber}" added successfully`);
    }
    
    // Update local state
    setBatches([...MOCK_BATCHES]);
    
    // Reset form and close dialog
    resetBatchForm();
    setNewBatchOpen(false);
  };
  
  const handleEditBatch = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    
    setEditingBatchId(batchId);
    setBatchSpiritId(batch.spiritId);
    setBatchNumber(batch.batchNumber);
    setBatchProof(batch.proof.toString());
    setBatchDate(batch.productionDate);
    setBatchLiters(batch.currentLiters.toString());
    const calculatedProofGallons = literToProofGallon(batch.currentLiters, batch.proof);
    setBatchProofGallons(calculatedProofGallons.toString());
    setBatchNotes(batch.notes || "");
    
    setNewBatchOpen(true);
  };
  
  const handleDeleteBatchPrompt = (batchId: string) => {
    setBatchToDelete(batchId);
    setDeleteBatchDialogOpen(true);
  };
  
  const handleDeleteBatchConfirm = () => {
    if (!batchToDelete) return;
    
    deleteBatch(batchToDelete);
    setBatches([...MOCK_BATCHES]);
    toast.success("Batch deleted successfully");
    
    setDeleteBatchDialogOpen(false);
    setBatchToDelete(null);
  };
  
  const generateBatchNumber = (spiritId: string) => {
    const spirit = spirits.find(s => s.id === spiritId);
    if (!spirit) return "";
    
    const prefix = spirit.type.substring(0, 2).toUpperCase();
    const year = new Date().getFullYear();
    const existingBatches = batches.filter(b => b.spiritId === spiritId);
    const count = existingBatches.length + 1;
    
    return `${prefix}-${year}-${count.toString().padStart(3, '0')}`;
  };
  
  const handleBatchSpiritChange = (value: string) => {
    setBatchSpiritId(value);
    const spirit = spirits.find(s => s.id === value);
    if (spirit) {
      setBatchProof(spirit.defaultProof.toString());
      if (!editingBatchId) {
        setBatchNumber(generateBatchNumber(value));
      }
    }
  };
  
  const resetSpiritForm = () => {
    setEditingSpiritId(null);
    setSpiritName("");
    setSpiritType("whiskey");
    setSpiritProof("80");
    setSpiritDescription("");
  };
  
  const resetBatchForm = () => {
    setEditingBatchId(null);
    setBatchSpiritId("");
    setBatchNumber("");
    setBatchProof("80");
    setBatchDate(new Date());
    setBatchLiters("0");
    setBatchProofGallons("0");
    setBatchNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spirits & Batches</h1>
          <p className="text-muted-foreground">
            Manage your spirits, create new batches, and track inventory
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={newBatchOpen} onOpenChange={(open) => {
            setNewBatchOpen(open);
            if (!open) resetBatchForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingBatchId ? "Edit Batch" : "Create New Batch"}</DialogTitle>
                <DialogDescription>
                  {editingBatchId ? "Edit existing batch details" : "Add a new batch of spirit to track production"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="batchSpirit">Spirit</Label>
                  <Select value={batchSpiritId} onValueChange={handleBatchSpiritChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select spirit" />
                    </SelectTrigger>
                    <SelectContent>
                      {spirits.map(spirit => (
                        <SelectItem key={spirit.id} value={spirit.id}>
                          {spirit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batchDate">Production Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !batchDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {batchDate ? format(batchDate, "MMMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto">
                        <Calendar
                          mode="single"
                          selected={batchDate}
                          onSelect={(date) => date && setBatchDate(date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchProof">Proof</Label>
                    <Input
                      id="batchProof"
                      type="number"
                      value={batchProof}
                      onChange={(e) => handleBatchProofChange(e.target.value)}
                      min="0"
                      max="200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batchLiters">Volume (Liters)</Label>
                    <Input
                      id="batchLiters"
                      type="number"
                      value={batchLiters}
                      onChange={(e) => handleBatchLitersChange(e.target.value)}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batchProofGallons">Proof Gallons (Calculated)</Label>
                  <Input
                    id="batchProofGallons"
                    value={batchProofGallons}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batchNotes">Notes</Label>
                  <Textarea
                    id="batchNotes"
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    placeholder="Optional notes about this batch"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetBatchForm();
                  setNewBatchOpen(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddBatch}>
                  {editingBatchId ? "Save Changes" : "Create Batch"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={newSpiritOpen} onOpenChange={(open) => {
            setNewSpiritOpen(open);
            if (!open) resetSpiritForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Spirit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingSpiritId ? "Edit Spirit" : "Create New Spirit"}</DialogTitle>
                <DialogDescription>
                  {editingSpiritId ? "Edit existing spirit details" : "Add a new spirit product to your catalog"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="spiritName">Spirit Name</Label>
                  <Input
                    id="spiritName"
                    value={spiritName}
                    onChange={(e) => setSpiritName(e.target.value)}
                    placeholder="e.g. Mountain Rye Whiskey"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spiritType">Type</Label>
                    <Select value={spiritType} onValueChange={(v) => setSpiritType(v as SpiritType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whiskey">Whiskey</SelectItem>
                        <SelectItem value="vodka">Vodka</SelectItem>
                        <SelectItem value="gin">Gin</SelectItem>
                        <SelectItem value="rum">Rum</SelectItem>
                        <SelectItem value="tequila">Tequila</SelectItem>
                        <SelectItem value="brandy">Brandy</SelectItem>
                        <SelectItem value="liqueur">Liqueur</SelectItem>
                        <SelectItem value="wine">Wine</SelectItem>
                        <SelectItem value="beer">Beer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="spiritProof">Default Proof</Label>
                    <Input
                      id="spiritProof"
                      type="number"
                      value={spiritProof}
                      onChange={(e) => setSpiritProof(e.target.value)}
                      min="0"
                      max="200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="spiritDescription">Description</Label>
                  <Textarea
                    id="spiritDescription"
                    value={spiritDescription}
                    onChange={(e) => setSpiritDescription(e.target.value)}
                    placeholder="Description of the spirit and tasting notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetSpiritForm();
                  setNewSpiritOpen(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddSpirit}>
                  {editingSpiritId ? "Save Changes" : "Create Spirit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="spirits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="spirits">Spirits</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="spirits" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {spirits.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No spirits found. Create your first spirit to get started.
              </div>
            ) : (
              spirits.map(spirit => (
                <Card key={spirit.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{spirit.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {spirit.type} | {spirit.defaultProof} proof
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditSpirit(spirit.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDeleteSpiritPrompt(spirit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    {spirit.description && (
                      <p className="text-sm mb-4">{spirit.description}</p>
                    )}
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      <p>Created: {format(spirit.createdAt, "MMMM d, yyyy")}</p>
                      <p>Active Batches: {batches.filter(b => b.spiritId === spirit.id).length}</p>
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSpiritId(spirit.id)}
                      >
                        View Batches
                      </Button>
                      
                      <Button 
                        size="sm"
                        onClick={() => {
                          setBatchSpiritId(spirit.id);
                          setBatchProof(spirit.defaultProof.toString());
                          setBatchNumber(generateBatchNumber(spirit.id));
                          setNewBatchOpen(true);
                        }}
                      >
                        New Batch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="batches" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Batch Inventory</CardTitle>
                  <CardDescription>
                    {selectedSpiritId 
                      ? `Viewing batches for ${spirits.find(s => s.id === selectedSpiritId)?.name}`
                      : 'All active batches'}
                  </CardDescription>
                </div>
                
                {selectedSpiritId && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedSpiritId(null)}
                  >
                    View All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Batch Number</th>
                      <th className="h-10 px-4 text-left font-medium">Spirit</th>
                      <th className="h-10 px-4 text-left font-medium">Production Date</th>
                      <th className="h-10 px-4 text-left font-medium">Proof</th>
                      <th className="h-10 px-4 text-left font-medium">Volume</th>
                      <th className="h-10 px-4 text-left font-medium">Status</th>
                      <th className="h-10 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="h-24 text-center text-muted-foreground">
                          No batches found
                        </td>
                      </tr>
                    ) : (
                      filteredBatches.map(batch => {
                        const spirit = spirits.find(s => s.id === batch.spiritId);
                        
                        return (
                          <tr key={batch.id} className="border-b">
                            <td className="p-4 font-medium">
                              {batch.batchNumber}
                            </td>
                            <td className="p-4">
                              {spirit?.name || "Unknown"}
                            </td>
                            <td className="p-4">
                              {format(batch.productionDate, "MMM d, yyyy")}
                            </td>
                            <td className="p-4">
                              {batch.proof}
                            </td>
                            <td className="p-4">
                              <div>
                                <div>{batch.currentLiters.toFixed(1)} L</div>
                                <div className="text-xs text-muted-foreground">
                                  {literToProofGallon(batch.currentLiters, batch.proof).toFixed(1)} PG
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="capitalize">
                                {batch.status.replace('_', ' ')}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditBatch(batch.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteBatchPrompt(batch.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={`/operations?batchId=${batch.id}`}>
                                    Log Op
                                  </a>
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
      
      {/* Delete Spirit Confirmation */}
      <AlertDialog open={deleteSpiritDialogOpen} onOpenChange={setDeleteSpiritDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Spirit</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the spirit and cannot be undone.
              Any batches associated with this spirit may become orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSpiritToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSpiritConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Batch Confirmation */}
      <AlertDialog open={deleteBatchDialogOpen} onOpenChange={setDeleteBatchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the batch and cannot be undone.
              Any operations associated with this batch may become orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBatchToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBatchConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Spirits;
