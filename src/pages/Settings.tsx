
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfileSettings } from '@/components/settings/UserProfileSettings';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { TeamManagement } from '@/components/settings/TeamManagement';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { ReportingSettings } from '@/components/settings/ReportingSettings';
import { InventorySettings } from '@/components/settings/InventorySettings';
import { TaxComplianceSettings } from '@/components/settings/TaxComplianceSettings';
import { DataBackupSettings } from '@/components/settings/DataBackupSettings';
import { AppCustomizationSettings } from '@/components/settings/AppCustomizationSettings';
import { User, Building2, Shield, Users, Settings as SettingsIcon, Calendar, Package, FileText, Database, Palette } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { value: 'profile', label: 'Profile', icon: User, component: UserProfileSettings },
    { value: 'company', label: 'Company', icon: Building2, component: CompanySettings },
    { value: 'business', label: 'Business', icon: SettingsIcon, component: BusinessSettings },
    { value: 'reporting', label: 'Reporting', icon: Calendar, component: ReportingSettings },
    { value: 'inventory', label: 'Inventory', icon: Package, component: InventorySettings },
    { value: 'tax', label: 'Tax & Compliance', icon: FileText, component: TaxComplianceSettings },
    { value: 'data', label: 'Data & Backup', icon: Database, component: DataBackupSettings },
    { value: 'customization', label: 'Customization', icon: Palette, component: AppCustomizationSettings },
    { value: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
    ...(user?.role === 'admin' ? [{ value: 'team', label: 'Team', icon: Users, component: TeamManagement }] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, company information, and application settings.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-full">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="flex items-center gap-2 whitespace-nowrap px-3 py-1.5"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-6">
            <tab.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Settings;
