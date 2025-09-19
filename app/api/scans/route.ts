import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import prisma  from '@/lib/models/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch latest 50 scans for the user
    const userScans = await prisma.scan.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        domain: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Attach summary for completed scans
    const scansWithSummary = await Promise.all(
      userScans.map(async (scan) => {
        if (scan.status === 'completed') {
          const results = await prisma.scanResult.findMany({
            where: {
              scanId: scan.id,
            },
            select: {
              severity: true,
            },
          });

          const summary = {
            totalVulnerabilities: results.length,
            criticalCount: results.filter(r => r.severity === 'critical').length,
            highCount: results.filter(r => r.severity === 'high').length,
            mediumCount: results.filter(r => r.severity === 'medium').length,
            lowCount: results.filter(r => r.severity === 'low').length,
          };

          return {
            ...scan,
            resultsSummary: summary,
          };
        }

        return scan;
      })
    );

    return NextResponse.json(scansWithSummary);
  } catch (error) {
    console.error('Failed to fetch scans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scans' },
      { status: 500 }
    );
  }
}