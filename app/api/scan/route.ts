import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/models/prisma'
import { canUserScan, incrementDailyScanCount } from '@/lib/models/scan-limits'
import { authClient } from '@/lib/auth-client'

export async function POST(request: NextRequest) {
  try {
    const { data: session } = await authClient.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Validate domain format
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }

    // Check scan eligibility (role + subscription handled inside)
    const scanCheck = await canUserScan(session.user.id)

    if (!scanCheck.canScan) {
      return NextResponse.json({ error: scanCheck.reason }, { status: 429 })
    }

    // Create scan record
    const newScan = await prisma.scan.create({
      data: {
        userId: session.user.id,
        domain,
        status: 'pending',
      },
    })

    // Increment daily scan count (only for free users)
    await incrementDailyScanCount(session.user.id)

    // Call backend API to start the scan
    try {
      const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scan_id: newScan.id,
          domain,
          callback_url: `${process.env.BETTER_AUTH_URL}/api/scan/callback`,
        }),
      })

      if (!backendResponse.ok) {
        await prisma.scan.update({
          where: { id: newScan.id },
          data: { status: 'failed' },
        })

        return NextResponse.json(
          { error: 'Failed to start scan on backend' },
          { status: 500 }
        )
      }

      // Update scan status to running
      await prisma.scan.update({
        where: { id: newScan.id },
        data: { status: 'running' },
      })
    } catch (backendError) {
      console.error('Backend API error:', backendError)

      await prisma.scan.update({
        where: { id: newScan.id },
        data: { status: 'failed' },
      })

      return NextResponse.json(
        { error: 'Backend service unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      message: 'Scan started successfully',
      scanId: newScan.id,
    })
  } catch (error) {
    console.error('Failed to start scan:', error)
    return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 })
  }
}