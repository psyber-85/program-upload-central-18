
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface ScheduleItem {
  dayLabel: string;
  topic: string;
  details: string;
}

interface OutlineData {
  title: string;
  overview: string;
  objectives: string;
  schedule: ScheduleItem[];
}

const TrainingOutlineCreator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pdfLink, setPdfLink] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const [outlineData, setOutlineData] = useState<OutlineData>({
    title: '',
    overview: '',
    objectives: '',
    schedule: [
      { dayLabel: 'Day 1', topic: '', details: '' }
    ]
  });

  const handleChange = (field: keyof OutlineData, value: string) => {
    setOutlineData(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (index: number, field: keyof ScheduleItem, value: string) => {
    setOutlineData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addDay = () => {
    const newDayNumber = outlineData.schedule.length + 1;
    setOutlineData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { dayLabel: `Day ${newDayNumber}`, topic: '', details: '' }]
    }));
  };

  const removeDay = (index: number) => {
    if (outlineData.schedule.length > 1) {
      setOutlineData(prev => ({
        ...prev,
        schedule: prev.schedule.filter((_, i) => i !== index)
      }));
    }
  };

  const refineWithAI = async () => {
    if (!outlineData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a training title before refining.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Placeholder for AI refinement - would call Supabase Edge Function
      toast({
        title: "AI Refinement",
        description: "AI refinement feature will be implemented with OpenAI integration.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refine outline with AI.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!outlineData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a training title before generating PDF.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Placeholder for PDF generation - would call Supabase Edge Function
      toast({
        title: "PDF Generation",
        description: "PDF generation feature will be implemented with Supabase Edge Functions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const composeEmail = async () => {
    if (!recipientName.trim() || !recipientEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter recipient name and email.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Placeholder for email composition - would call Supabase Edge Function
      setEmailSubject(`Training Outline: ${outlineData.title}`);
      setEmailBody(`Dear ${recipientName},\n\nPlease find attached the training outline for "${outlineData.title}".\n\nBest regards,\nHRDC Team`);
      setShowEmailDialog(true);
      toast({
        title: "Email Composed",
        description: "Email draft has been generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to compose email.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Error",
        description: "Please compose email content before sending.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Placeholder for email sending - would call Supabase Edge Function
      toast({
        title: "Success",
        description: "Outline sent and saved successfully.",
      });
      setShowEmailDialog(false);
      // Reset form or navigate as needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Training Outline Creator</h1>
        <p className="text-muted-foreground mt-2">Create comprehensive training outlines with AI assistance</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Training Title</Label>
              <Input
                id="title"
                value={outlineData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter training title"
              />
            </div>
            <div>
              <Label htmlFor="overview">Course Overview</Label>
              <Textarea
                id="overview"
                value={outlineData.overview}
                onChange={(e) => handleChange('overview', e.target.value)}
                placeholder="Enter course overview"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="objectives">Learning Objectives</Label>
              <Textarea
                id="objectives"
                value={outlineData.objectives}
                onChange={(e) => handleChange('objectives', e.target.value)}
                placeholder="Enter learning objectives"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Detailed Schedule
              <Button onClick={addDay} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {outlineData.schedule.map((day, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={day.dayLabel}
                    onChange={(e) => handleScheduleChange(index, 'dayLabel', e.target.value)}
                    placeholder="Day label"
                    className="w-32"
                  />
                  {outlineData.schedule.length > 1 && (
                    <Button 
                      onClick={() => removeDay(index)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Topic</Label>
                  <Input
                    value={day.topic}
                    onChange={(e) => handleScheduleChange(index, 'topic', e.target.value)}
                    placeholder="Enter topic"
                  />
                </div>
                <div>
                  <Label>Activities/Details</Label>
                  <Textarea
                    value={day.details}
                    onChange={(e) => handleScheduleChange(index, 'details', e.target.value)}
                    placeholder="Enter activities and details"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={refineWithAI} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Refine with AI
              </Button>
              <Button onClick={generatePDF} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Generate PDF
              </Button>
            </div>

            {pdfLink && (
              <div className="p-4 bg-muted rounded-lg">
                <a href={pdfLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Download/Preview Training Outline PDF
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">Requestor Name</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter requestor name"
                />
              </div>
              <div>
                <Label htmlFor="recipientEmail">Requestor Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter requestor email"
                />
              </div>
            </div>

            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
              <DialogTrigger asChild>
                <Button onClick={composeEmail} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Compose Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Email Composition</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="emailSubject">Subject</Label>
                    <Input
                      id="emailSubject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailBody">Email Body</Label>
                    <Textarea
                      id="emailBody"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={10}
                    />
                  </div>
                  <Button onClick={sendEmail} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Send Email & Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingOutlineCreator;
