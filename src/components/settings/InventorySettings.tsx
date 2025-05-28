
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Save, Package, Plus, Trash2 } from 'lucide-react';

interface InventoryForm {
  primaryUnit: string;
  secondaryUnit: string;
  defaultBottleSize: string;
  defaultABV: string;
}

interface ProductCategory {
  id: string;
  name: string;
  defaultABV: string;
}

interface WarehouseLocation {
  id: string;
  name: string;
  type: string;
}

export const InventorySettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([
    { id: '1', name: 'Gin', defaultABV: '40' },
    { id: '2', name: 'Vodka', defaultABV: '40' },
    { id: '3', name: 'Rum', defaultABV: '40' },
  ]);
  const [warehouseLocations, setWarehouseLocations] = useState<WarehouseLocation[]>([
    { id: '1', name: 'Main Distillery', type: 'distillery' },
    { id: '2', name: 'Bonded Storage', type: 'bonded_storage' },
  ]);

  const form = useForm<InventoryForm>({
    defaultValues: {
      primaryUnit: 'proof_gallons',
      secondaryUnit: 'liters',
      defaultBottleSize: '750',
      defaultABV: '40',
    },
  });

  const onSubmit = async (data: InventoryForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Inventory settings updated successfully');
    } catch (error) {
      toast.error('Failed to update inventory settings');
    } finally {
      setIsLoading(false);
    }
  };

  const addProductCategory = () => {
    const newCategory: ProductCategory = {
      id: Date.now().toString(),
      name: 'New Category',
      defaultABV: '40',
    };
    setProductCategories([...productCategories, newCategory]);
  };

  const removeProductCategory = (id: string) => {
    setProductCategories(productCategories.filter(cat => cat.id !== id));
  };

  const addWarehouseLocation = () => {
    const newLocation: WarehouseLocation = {
      id: Date.now().toString(),
      name: 'New Location',
      type: 'distillery',
    };
    setWarehouseLocations([...warehouseLocations, newLocation]);
  };

  const removeWarehouseLocation = (id: string) => {
    setWarehouseLocations(warehouseLocations.filter(loc => loc.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory & Production Settings
        </CardTitle>
        <CardDescription>
          Configure units of measure, product categories, and warehouse locations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Units of Measure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="proof_gallons">Proof Gallons</SelectItem>
                          <SelectItem value="wine_gallons">Wine Gallons</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="bottles">Bottles</SelectItem>
                          <SelectItem value="cases">Cases</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select secondary unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="bottles">Bottles</SelectItem>
                          <SelectItem value="cases">Cases</SelectItem>
                          <SelectItem value="proof_gallons">Proof Gallons</SelectItem>
                          <SelectItem value="wine_gallons">Wine Gallons</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultBottleSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Bottle Size (ml)</FormLabel>
                      <FormControl>
                        <Input placeholder="750" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultABV"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default ABV (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="40" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Product Categories</h3>
                <Button type="button" onClick={addProductCategory} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              <div className="space-y-2">
                {productCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2 p-2 border rounded">
                    <Input 
                      value={category.name} 
                      onChange={(e) => {
                        const updated = productCategories.map(cat => 
                          cat.id === category.id ? { ...cat, name: e.target.value } : cat
                        );
                        setProductCategories(updated);
                      }}
                      className="flex-1"
                    />
                    <Input 
                      value={category.defaultABV}
                      onChange={(e) => {
                        const updated = productCategories.map(cat => 
                          cat.id === category.id ? { ...cat, defaultABV: e.target.value } : cat
                        );
                        setProductCategories(updated);
                      }}
                      placeholder="ABV %"
                      className="w-20"
                    />
                    <Button 
                      type="button"
                      onClick={() => removeProductCategory(category.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Warehouse Locations</h3>
                <Button type="button" onClick={addWarehouseLocation} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
              <div className="space-y-2">
                {warehouseLocations.map((location) => (
                  <div key={location.id} className="flex items-center gap-2 p-2 border rounded">
                    <Input 
                      value={location.name}
                      onChange={(e) => {
                        const updated = warehouseLocations.map(loc => 
                          loc.id === location.id ? { ...loc, name: e.target.value } : loc
                        );
                        setWarehouseLocations(updated);
                      }}
                      className="flex-1"
                    />
                    <Select 
                      value={location.type}
                      onValueChange={(value) => {
                        const updated = warehouseLocations.map(loc => 
                          loc.id === location.id ? { ...loc, type: value } : loc
                        );
                        setWarehouseLocations(updated);
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distillery">Distillery</SelectItem>
                        <SelectItem value="bonded_storage">Bonded Storage</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button"
                      onClick={() => removeWarehouseLocation(location.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
