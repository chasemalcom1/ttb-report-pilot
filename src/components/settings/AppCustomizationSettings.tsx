
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Save, Palette, Upload, Moon, Sun } from 'lucide-react';

interface AppCustomizationForm {
  theme: string;
  companyLogo: string;
  sidebarLayout: string;
  compactMode: boolean;
  showWelcomeTips: boolean;
}

export const AppCustomizationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AppCustomizationForm>({
    defaultValues: {
      theme: 'system',
      companyLogo: '',
      sidebarLayout: 'expanded',
      compactMode: false,
      showWelcomeTips: true,
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
    toast.success('Logo upload feature coming soon');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          App Customization
        </CardTitle>
        <CardDescription>
          Customize the look and feel of your application interface.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theme Settings</h3>
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light Mode
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark Mode
                          </div>
                        </SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose between light, dark, or system preference
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Branding</h3>
              <FormField
                control={form.control}
                name="companyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="No logo uploaded" {...field} readOnly />
                      </FormControl>
                      <Button type="button" onClick={handleLogoUpload} variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    <FormDescription>
                      Upload your company logo (PNG, JPG, SVG - max 2MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Layout Settings</h3>
              <FormField
                control={form.control}
                name="sidebarLayout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sidebar Layout</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expanded">Always Expanded</SelectItem>
                        <SelectItem value="collapsed">Always Collapsed</SelectItem>
                        <SelectItem value="auto">Auto (based on screen size)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Control the default sidebar behavior
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compactMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Compact Mode</FormLabel>
                      <FormDescription>
                        Use smaller spacing and condensed layouts
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

              <FormField
                control={form.control}
                name="showWelcomeTips"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show Welcome Tips</FormLabel>
                      <FormDescription>
                        Display helpful tips and onboarding guidance
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
              <h4 className="font-medium mb-2">Quick Actions</h4>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm">
                  Reset to Defaults
                </Button>
                <Button type="button" variant="outline" size="sm">
                  Import Theme
                </Button>
                <Button type="button" variant="outline" size="sm">
                  Export Settings
                </Button>
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
