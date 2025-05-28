
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Save, Package, Plus, X } from 'lucide-react';

interface InventoryForm {
  defaultUnit: string;
  bottleSizes: string[];
  productCategories: string[];
  warehouseLocations: string[];
}

export const InventorySettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [newBottleSize, setNewBottleSize] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const form = useForm<InventoryForm>({
    defaultValues: {
      defaultUnit: 'proof_gallons',
      bottleSizes: ['375ml', '750ml', '1L', '1.75L'],
      productCategories: ['Whiskey', 'Vodka', 'Gin', 'Rum', 'Brandy'],
      warehouseLocations: ['Main Distillery', 'Bonded Storage', 'Retail Location'],
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

  const addBottleSize = () => {
    if (newBottleSize.trim()) {
      const current = form.getValues('bottleSizes');
      form.setValue('bottleSizes', [...current, newBottleSize.trim()]);
      setNewBottleSize('');
    }
  };

  const removeBottleSize = (index: number) => {
    const current = form.getValues('bottleSizes');
    form.setValue('bottleSizes', current.filter((_, i) => i !== index));
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      const current = form.getValues('productCategories');
      form.setValue('productCategories', [...current, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (index: number) => {
    const current = form.getValues('productCategories');
    form.setValue('productCategories', current.filter((_, i) => i !== index));
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      const current = form.getValues('warehouseLocations');
      form.setValue('warehouseLocations', [...current, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    const current = form.getValues('warehouseLocations');
    form.setValue('warehouseLocations', current.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory & Production Settings
        </CardTitle>
        <CardDescription>
          Configure units, bottle sizes, product categories, and warehouse locations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="defaultUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Units of Measure</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="proof_gallons">Proof Gallons</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="bottles">Bottles</SelectItem>
                      <SelectItem value="cases">Cases</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Bottle Sizes</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Add bottle size (e.g., 750ml)"
                  value={newBottleSize}
                  onChange={(e) => setNewBottleSize(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBottleSize())}
                />
                <Button type="button" onClick={addBottleSize} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('bottleSizes').map((size, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md">
                    <span className="text-sm">{size}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBottleSize(index)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product Categories</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Add product category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                />
                <Button type="button" onClick={addCategory} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('productCategories').map((category, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md">
                    <span className="text-sm">{category}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory(index)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Warehouse Locations</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Add warehouse location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                />
                <Button type="button" onClick={addLocation} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('warehouseLocations').map((location, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md">
                    <span className="text-sm">{location}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLocation(index)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
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
