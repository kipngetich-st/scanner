import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scans, scanResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface ScanResult {
  vulnerability_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation?: string;
  affected_url?: string;
  evidence?: string;
}

interface CallbackPayload {
  scan_id: string;
  status: 'completed' | 'failed';
  results?: ScanResult[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: CallbackPayload = await request.json();
    const { scan_id, status, results, error } = payload;

    if (!scan_id) {
      return NextResponse.json({ error: 'Scan ID is required' }, { status: 400 });
    }

    // Update scan status
    await db.update(scans)
      .set({ 
        status,
        completedAt: new Date(),
      })
      .where(eq(scans.id, scan_id));

    // If scan completed successfully, store results
    if (status === 'completed' && results && results.length > 0) {
      const scanResultsData = results.map(result => ({
        scanId: scan_id,
        vulnerabilityType: result.vulnerability_type,
        severity: result.severity,
        description: result.description,
        recommendation: result.recommendation,
        affectedUrl: result.affected_url,
        evidence: result.evidence,
      }));

      await db.insert(scanResults).values(scanResultsData);
    }

    return NextResponse.json({ message: 'Callback processed successfully' });

  } catch (error) {
    console.error('Failed to process scan callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}