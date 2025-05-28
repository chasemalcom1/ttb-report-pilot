
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Save, Building2 } from 'lucide-react';

interface BusinessForm {
  permitType: string;
  ttbRegion: string;
  dspAddress: string;
  bondedPremise: boolean;
  operationalStatus: string;
}

export const BusinessSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BusinessForm>({
    defaultValues: {
      permitType: 'distilled_spirits_plant',
      ttbRegion: '',
      dspAddress: '',
      bondedPremise: true,
      operationalStatus: 'active',
    },
  });

  const onSubmit = async (data: BusinessForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Business settings updated successfully');
    } catch (error) {
      toast.error('Failed to update business settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Settings
        </CardTitle>
        <CardDescription>
          Configure your business type, permits, and operational details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="permitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permit Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select permit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="distilled_spirits_plant">Distilled Spirits Plant</SelectItem>
                        <SelectItem value="bonded_winery">Bonded Winery</SelectItem>
                        <SelectItem value="brewery">Brewery</SelectItem>
                        <SelectItem value="rectifier">Rectifier</SelectItem>
                        <SelectItem value="importer">Importer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ttbRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TTB Region / Jurisdiction</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter TTB region" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dspAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>DSP Premises Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter DSP premises address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bondedPremise"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Bonded Premise</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable if this is a bonded premise
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operationalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operational Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operational status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
