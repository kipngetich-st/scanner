'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye, Download, FileText } from 'lucide-react';

interface ScanHistoryItem {
  id: string;
  domain: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  resultsSummary?: {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

interface ScanHistoryProps {
  userRole: string;
}

export function ScanHistory({ userRole }: ScanHistoryProps) {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('/api/scans');
      if (response.ok) {
        const data = await response.json();
        setScans(data);
      }
    } catch (error) {
      console.error('Failed to fetch scan history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'default',
      failed: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string, count: number) => {
    if (count === 0) return null;
    
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline',
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants]} className="mr-1">
        {count} {severity}
      </Badge>
    );
  };

  const handleViewResults = (scanId: string) => {
    // Navigate to detailed results page
    window.location.href = `/dashboard/scans/${scanId}`;
  };

  const handleDownloadReport = async (scanId: string, format: 'pdf' | 'csv') => {
    if (userRole !== 'pro' && userRole !== 'admin') {
      alert('Upgrade to Pro to download reports');
      return;
    }

    try {
      const response = await fetch(`/api/scans/${scanId}/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan-report-${scanId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>Loading your recent scans...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan History</CardTitle>
        <CardDescription>
          Your recent vulnerability scans and their results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No scans yet. Run your first scan to get started!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Results Summary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium">{scan.domain}</TableCell>
                  <TableCell>{getStatusBadge(scan.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Started: {format(new Date(scan.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                      {scan.completedAt && (
                        <div className="text-muted-foreground">
                          Completed: {format(new Date(scan.completedAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {scan.resultsSummary && scan.status === 'completed' ? (
                      <div className="flex flex-wrap gap-1">
                        {getSeverityBadge('critical', scan.resultsSummary.criticalCount)}
                        {getSeverityBadge('high', scan.resultsSummary.highCount)}
                        {getSeverityBadge('medium', scan.resultsSummary.mediumCount)}
                        {getSeverityBadge('low', scan.resultsSummary.lowCount)}
                        {scan.resultsSummary.totalVulnerabilities === 0 && (
                          <Badge variant="outline">No issues found</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {scan.status === 'completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResults(scan.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {(userRole === 'pro' || userRole === 'admin') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(scan.id, 'pdf')}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(scan.id, 'csv')}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                CSV
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}