'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Scan, AlertTriangle, Shield, Zap } from 'lucide-react';

interface ScanFormProps {
  userRole: string;
  dailyScanCount: number;
}

export function ScanForm({ userRole, dailyScanCount }: ScanFormProps) {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter(); // ✅ use router for refresh

  const FREE_DAILY_LIMIT = 3;
  const canScan =
    userRole === 'pro' || userRole === 'admin' || dailyScanCount < FREE_DAILY_LIMIT;
  const remainingScans =
    userRole === 'free' ? FREE_DAILY_LIMIT - dailyScanCount : null;

  const validateDomain = (domain: string): boolean => {
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!domain.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a domain to scan.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateDomain(domain.trim())) {
      toast({
        title: 'Invalid Domain',
        description: 'Please enter a valid domain name (e.g., example.com).',
        variant: 'destructive',
      });
      return;
    }

    if (!canScan) {
      toast({
        title: 'Scan Limit Reached',
        description:
          'You have reached your daily scan limit. Upgrade to Pro for unlimited scans.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Scan Started',
          description: `Vulnerability scan initiated for ${domain}. You'll be notified when it's complete.`,
        });
        setDomain('');
        setIsDialogOpen(false);

        router.refresh(); // ✅ trigger server component re-render
      } else {
        toast({
          title: 'Scan Failed',
          description: data.error || 'Failed to start scan. Please try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description:
          'Failed to start scan. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Run Security Scan
          </span>
        </CardTitle>
        <CardDescription>
          Detect vulnerabilities, malware, and security threats on any website
          {userRole === 'free' && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>
                Free plan: {remainingScans} scan
                {remainingScans !== 1 ? 's' : ''} remaining today
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
              disabled={!canScan}
              size="lg"
            >
              <Scan className="mr-2 h-5 w-5" />
              {canScan ? 'Start New Scan' : 'Daily Limit Reached'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Start Security Scan
              </DialogTitle>
              <DialogDescription>
                Enter the website URL you want to scan for vulnerabilities,
                malware, and security threats.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-sm font-medium">
                  Website URL
                </Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-12"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter domain without protocol (e.g., example.com, not
                  https://example.com)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? 'Starting...' : 'Start Scan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {!canScan && userRole === 'free' && (
          <div className="mt-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  Daily Scan Limit Reached
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Free users can perform up to {FREE_DAILY_LIMIT} scans per day.
                  Upgrade to Pro for unlimited scans and advanced features.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}