
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Save, Database, Download, Upload, Cloud } from 'lucide-react';

interface DataBackupForm {
  backupFrequency: string;
  retentionPeriod: string;
  cloudStorage: string;
  autoBackup: boolean;
}

export const DataBackupSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DataBackupForm>({
    defaultValues: {
      backupFrequency: 'daily',
      retentionPeriod: '90_days',
      cloudStorage: 'none',
      autoBackup: true,
    },
  });

  const onSubmit = async (data: DataBackupForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Data & backup settings updated successfully');
    } catch (error) {
      toast.error('Failed to update data & backup settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualExport = async () => {
    try {
      toast.success('Data export started - you will receive a download link shortly');
    } catch (error) {
      toast.error('Failed to start data export');
    }
  };

  const handleRestore = async () => {
    try {
      toast.success('Restore process initiated');
    } catch (error) {
      toast.error('Failed to start restore process');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data & Backup
        </CardTitle>
        <CardDescription>
          Manage data exports, backups, and cloud storage integration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Manual Export Options</h3>
          <div className="flex gap-2">
            <Button onClick={handleManualExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
            <Button onClick={handleRestore} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Restore from Backup
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Automated Backup Settings</h3>
              
              <FormField
                control={form.control}
                name="autoBackup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Automated Backups</FormLabel>
                      <FormDescription>
                        Enable automatic backups of all application data
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="backupFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backup Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retentionPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Retention Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30_days">30 Days</SelectItem>
                          <SelectItem value="90_days">90 Days</SelectItem>
                          <SelectItem value="1_year">1 Year</SelectItem>
                          <SelectItem value="3_years">3 Years</SelectItem>
                          <SelectItem value="7_years">7 Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cloud Storage Integration</h3>
              
              <FormField
                control={form.control}
                name="cloudStorage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cloud Storage Provider</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cloud storage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="dropbox">Dropbox</SelectItem>
                        <SelectItem value="google_drive">Google Drive</SelectItem>
                        <SelectItem value="amazon_s3">Amazon S3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Connect to a cloud storage provider for automatic backup storage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('cloudStorage') !== 'none' && (
                <Button type="button" variant="outline">
                  <Cloud className="h-4 w-4 mr-2" />
                  Configure {form.watch('cloudStorage')} Integration
                </Button>
              )}
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
