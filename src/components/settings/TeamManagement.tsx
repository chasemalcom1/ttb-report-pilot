
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import { Users, UserPlus, Mail, Trash2, Edit } from 'lucide-react';

interface InviteUserForm {
  email: string;
  role: 'admin' | 'production' | 'accounting';
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'production' | 'accounting';
  status: 'active' | 'invited' | 'inactive';
  lastLogin: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Distiller',
    email: 'admin@distillery.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-05-28',
  },
  {
    id: '2',
    name: 'Sarah Production',
    email: 'production@distillery.com',
    role: 'production',
    status: 'active',
    lastLogin: '2024-05-27',
  },
  {
    id: '3',
    name: 'Mike Accounting',
    email: 'accounting@distillery.com',
    role: 'accounting',
    status: 'active',
    lastLogin: '2024-05-26',
  },
];

export const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const inviteForm = useForm<InviteUserForm>({
    defaultValues: {
      email: '',
      role: 'production',
      name: '',
    },
  });

  const onInviteUser = async (data: InviteUserForm) => {
    setIsInviting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        status: 'invited',
        lastLogin: 'Never',
      };
      
      setTeamMembers([...teamMembers, newMember]);
      toast.success('Invitation sent successfully');
      inviteForm.reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
    toast.success('Team member removed');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'production':
        return 'bg-blue-100 text-blue-800';
      case 'accounting':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage team members, roles, and permissions for your organization.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to a new team member to join your organization.
                  </DialogDescription>
                </DialogHeader>
                <Form {...inviteForm}>
                  <form onSubmit={inviteForm.handleSubmit(onInviteUser)} className="space-y-4">
                    <FormField
                      control={inviteForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={inviteForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={inviteForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="production">Production</SelectItem>
                              <SelectItem value="accounting">Accounting</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isInviting}>
                        {isInviting ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(member.role)}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can access and manage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-red-100 text-red-800">Admin</Badge>
              </div>
              <ul className="text-sm space-y-1">
                <li>• Full system access</li>
                <li>• Manage team members</li>
                <li>• Configure company settings</li>
                <li>• Generate all reports</li>
                <li>• View all operations</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-100 text-blue-800">Production</Badge>
              </div>
              <ul className="text-sm space-y-1">
                <li>• Log operations</li>
                <li>• Manage spirits & batches</li>
                <li>• View production reports</li>
                <li>• Update inventory</li>
                <li>• Limited settings access</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-green-100 text-green-800">Accounting</Badge>
              </div>
              <ul className="text-sm space-y-1">
                <li>• Generate financial reports</li>
                <li>• View TTB forms</li>
                <li>• Export compliance data</li>
                <li>• Read-only operations</li>
                <li>• Tax reporting access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
