import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { roleRepo } from '@/lib/placement/client';
import type { WorkArrangement, EmploymentType, RoleStatus } from '@/lib/placement/types';

const roleSchema = z.object({
  title: z.string().min(2, 'Title is required').max(100),
  department: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  workArrangement: z.enum(['ONSITE', 'HYBRID', 'REMOTE']),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
  location: z.string().min(2, 'Location is required'),
  headcount: z.coerce.number().min(1, 'At least 1 position required'),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

export function NewRole() {
  const navigate = useNavigate();
  const { session } = usePlacementAuth();
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<string[]>([]);
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [newNiceToHave, setNewNiceToHave] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      title: '',
      department: '',
      description: '',
      workArrangement: 'HYBRID',
      employmentType: 'FULL_TIME',
      location: 'Singapore',
      headcount: 1,
    },
  });

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addNiceToHave = () => {
    if (newNiceToHave.trim() && !niceToHave.includes(newNiceToHave.trim())) {
      setNiceToHave([...niceToHave, newNiceToHave.trim()]);
      setNewNiceToHave('');
    }
  };

  const removeNiceToHave = (index: number) => {
    setNiceToHave(niceToHave.filter((_, i) => i !== index));
  };

  async function onSubmit(data: RoleFormData, asDraft: boolean = true) {
    if (!session?.companyId || !session?.companyName) {
      toast({ title: 'Error', description: 'Company information missing', variant: 'destructive' });
      return;
    }

    if (requirements.length === 0) {
      toast({ title: 'Error', description: 'Add at least one requirement', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const status: RoleStatus = asDraft ? 'DRAFT' : 'OPEN';
      await roleRepo.create({
        companyId: session.companyId,
        companyName: session.companyName,
        title: data.title,
        department: data.department,
        description: data.description,
        requirements,
        niceToHave: niceToHave.length > 0 ? niceToHave : undefined,
        workArrangement: data.workArrangement as WorkArrangement,
        employmentType: data.employmentType as EmploymentType,
        location: data.location,
        headcount: data.headcount,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        status,
        createdById: session.userId,
        createdByName: session.userName,
        loiStatus: 'NOT_REQUESTED',
      });

      toast({
        title: asDraft ? 'Role saved as draft' : 'Role published',
        description: asDraft 
          ? 'You can edit and publish it later'
          : 'AIHQ will start matching candidates',
      });
      navigate('/employer/roles');
    } catch (error) {
      console.error('Failed to create role:', error);
      toast({ title: 'Error', description: 'Failed to create role', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/employer/roles')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Role</h1>
          <p className="text-muted-foreground">Define your open position</p>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Engineering" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the role, responsibilities, and what success looks like..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FormLabel>Must-Have Requirements *</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a requirement"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addRequirement}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="py-1.5 px-3">
                      {req}
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <FormLabel>Nice-to-Have (Optional)</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a nice-to-have"
                    value={newNiceToHave}
                    onChange={(e) => setNewNiceToHave(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addNiceToHave();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addNiceToHave}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {niceToHave.map((item, index) => (
                    <Badge key={index} variant="outline" className="py-1.5 px-3">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeNiceToHave(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Details */}
          <Card>
            <CardHeader>
              <CardTitle>Work Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="workArrangement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Arrangement *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ONSITE">Onsite</SelectItem>
                          <SelectItem value="HYBRID">Hybrid</SelectItem>
                          <SelectItem value="REMOTE">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">Full Time</SelectItem>
                          <SelectItem value="PART_TIME">Part Time</SelectItem>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="headcount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Positions *</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Min (SGD)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="e.g. 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Max (SGD)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="e.g. 8000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/employer/roles')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={form.handleSubmit((data) => onSubmit(data, true))}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={form.handleSubmit((data) => onSubmit(data, false))}
            >
              Publish Role
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
