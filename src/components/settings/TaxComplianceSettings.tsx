
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Save, FileText, AlertTriangle } from 'lucide-react';

interface TaxComplianceForm {
  stateExciseRate: string;
  autoCalculateTax: boolean;
  exportDutyRate: string;
  maxProofThreshold: string;
  lowInventoryThreshold: string;
  overdueReportWarning: boolean;
}

export const TaxComplianceSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TaxComplianceForm>({
    defaultValues: {
      stateExciseRate: '2.50',
      autoCalculateTax: true,
      exportDutyRate: '0.00',
      maxProofThreshold: '10000',
      lowInventoryThreshold: '100',
      overdueReportWarning: true,
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
          Tax & Compliance
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
                  name="stateExciseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State Excise Tax Rate ($ per proof gallon)</FormLabel>
                      <FormControl>
                        <Input placeholder="2.50" {...field} />
                      </FormControl>
                      <FormDescription>
                        Override default state excise tax rate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exportDutyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Export Duty Rate ($ per proof gallon)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Rate for products exported outside the US
                      </FormDescription>
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
                        Automatically calculate tax obligations based on operations
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
              <h3 className="text-lg font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warning Thresholds
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxProofThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Proof Production per Month (gallons)</FormLabel>
                      <FormControl>
                        <Input placeholder="10000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Warn when monthly production exceeds this limit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowInventoryThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Inventory Threshold (gallons)</FormLabel>
                      <FormControl>
                        <Input placeholder="100" {...field} />
                      </FormControl>
                      <FormDescription>
                        Warn when inventory falls below this level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="overdueReportWarning"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Overdue Report Warnings</FormLabel>
                      <FormDescription>
                        Show warnings for overdue tax reports and filings
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

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Compliance Notes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tax rates should be verified with current state regulations</li>
                <li>• Federal excise tax is automatically calculated based on current rates</li>
                <li>• Export duties may vary by destination country</li>
                <li>• Consult with a tax professional for complex situations</li>
              </ul>
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
