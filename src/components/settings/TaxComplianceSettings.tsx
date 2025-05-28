
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Save, FileText } from 'lucide-react';

interface TaxComplianceForm {
  stateExciseTaxRate: string;
  autoCalculateTax: boolean;
  exportDutyRate: string;
  maxProofThreshold: string;
  lowInventoryThreshold: string;
  customWarnings: boolean;
}

export const TaxComplianceSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TaxComplianceForm>({
    defaultValues: {
      stateExciseTaxRate: '3.30',
      autoCalculateTax: true,
      exportDutyRate: '0.00',
      maxProofThreshold: '10000',
      lowInventoryThreshold: '100',
      customWarnings: true,
    },
  });

  const onSubmit = async (data: TaxComplianceForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Tax & compliance settings updated successfully');
    } catch (error) {
      toast.error('Failed to update tax & compliance settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Taxes & Compliance
        </CardTitle>
        <CardDescription>
          Configure tax rates, compliance thresholds, and warning settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tax Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stateExciseTaxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State Excise Tax Rate (per proof gallon)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="0.00" {...field} className="pl-6" />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        </div>
                      </FormControl>
                      <FormDescription>Enter the state excise tax rate per proof gallon</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exportDutyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Export Duty Rate (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="0.00" {...field} className="pr-6" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>Export duty rate as percentage</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="autoCalculateTax"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-Calculate Tax Due</FormLabel>
                      <FormDescription>
                        Automatically calculate tax amounts based on production and withdrawal data
                      </FormDescription>
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Warning Thresholds</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxProofThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Proof Production (monthly)</FormLabel>
                      <FormControl>
                        <Input placeholder="10000" {...field} />
                      </FormControl>
                      <FormDescription>Warning threshold for monthly proof gallon production</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowInventoryThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Inventory Threshold</FormLabel>
                      <FormControl>
                        <Input placeholder="100" {...field} />
                      </FormControl>
                      <FormDescription>Warning when inventory falls below this amount</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customWarnings"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Custom Warning Notifications</FormLabel>
                      <FormDescription>
                        Enable custom warnings for compliance thresholds and unusual activities
                      </FormDescription>
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
