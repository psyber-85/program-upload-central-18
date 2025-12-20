import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface GenerateDraftButtonProps {
  label?: string;
  onGenerate?: () => Promise<void>;
  successMessage?: string;
}

export function GenerateDraftButton({ 
  label = 'Generate LOI Draft',
  onGenerate,
  successMessage = 'Draft generated successfully!'
}: GenerateDraftButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setIsLoading(true);
    
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    if (onGenerate) {
      await onGenerate();
    }
    
    setIsLoading(false);
    
    toast({
      title: 'Draft Generated',
      description: successMessage,
    });
  };

  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {isLoading ? 'Generating...' : label}
    </Button>
  );
}
