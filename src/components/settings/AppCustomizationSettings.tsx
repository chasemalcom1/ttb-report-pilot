
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Save, Palette, Upload, Sun, Moon } from 'lucide-react';

interface AppCustomizationForm {
  theme: string;
  darkMode: boolean;
  logoUrl: string;
  primaryColor: string;
  sidebarShortcuts: string[];
}

export const AppCustomizationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AppCustomizationForm>({
    defaultValues: {
      theme: 'default',
      darkMode: false,
      logoUrl: '',
      primaryColor: '#0ea5e9',
      sidebarShortcuts: ['dashboard', 'operations', 'spirits'],
    },
  });

  const onSubmit = async (data: AppCustomizationForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('App customization settings updated successfully');
    } catch (error) {
      toast.error('Failed to update app customization settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = () => {
    // In a real app, this would trigger a file upload dialog
    toast.info('Logo upload functionality would be implemented here');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          App Customization
        </CardTitle>
        <CardDescription>
          Customize the appearance and behavior of your application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theme & Appearance</h3>
              
              <FormField
                control={form.control}
                name="darkMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        {field.value ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        Dark Mode
                      </FormLabel>
                      <FormDescription>
                        Toggle between light and dark theme
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
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" {...field} className="w-20 h-10" />
                          <Input {...field} placeholder="#0ea5e9" className="flex-1" />
                        </div>
                      </FormControl>
                      <FormDescription>Choose your brand's primary color</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Branding</h3>
              
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Input placeholder="Logo URL or upload a file" {...field} />
                      </FormControl>
                      <Button type="button" onClick={handleLogoUpload} variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                    <FormDescription>Upload your company logo or enter a URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sidebar Configuration</h3>
              <FormDescription>
                Configure which items appear in your sidebar for quick access
              </FormDescription>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { value: 'dashboard', label: 'Dashboard' },
                  { value: 'operations', label: 'Operations' },
                  { value: 'spirits', label: 'Spirits' },
                  { value: 'reports', label: 'Reports' },
                  { value: 'settings', label: 'Settings' },
                  { value: 'inventory', label: 'Inventory' },
                ].map((item) => (
                  <div key={item.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={item.value}
                      defaultChecked={form.getValues('sidebarShortcuts').includes(item.value)}
                      onChange={(e) => {
                        const current = form.getValues('sidebarShortcuts');
                        if (e.target.checked) {
                          form.setValue('sidebarShortcuts', [...current, item.value]);
                        } else {
                          form.setValue('sidebarShortcuts', current.filter(s => s !== item.value));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={item.value} className="text-sm font-medium">
                      {item.label}
                    </label>
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
