import prisma from '@/lib/models/prisma'
import { format } from 'date-fns'
import { getUserAccessInfo } from './user-access'

const FREE_DAILY_LIMIT = 3

export async function getDailyScanCount(userId: string, date?: Date): Promise<number> {
  const targetDate = format(date || new Date(), 'yyyy-MM-dd')

  const dailyLimit = await prisma.dailyScanLimit.findUnique({
    where: {
      userId_date: {
        userId,
        date: new Date(targetDate),
      },
    },
    select: { scanCount: true },
  })

  return dailyLimit?.scanCount ?? 0
}

export async function incrementDailyScanCount(userId: string, date?: Date): Promise<void> {
  const targetDate = format(date || new Date(), 'yyyy-MM-dd')

  await prisma.dailyScanLimit.upsert({
    where: {
      userId_date: {
        userId,
        date: new Date(targetDate),
      },
    },
    update: {
      scanCount: { increment: 1 },
      updatedAt: new Date(),
    },
    create: {
      userId,
      date: new Date(targetDate),
      scanCount: 1,
    },
  })
}

export async function canUserScan(
  userId: string
): Promise<{ canScan: boolean; reason?: string }> {
  const access = await getUserAccessInfo(userId)

  // Pro or Admin users can scan without limit
  if (access.isPro || access.role === 'admin') {
    return { canScan: true }
  }

  const dailyCount = await getDailyScanCount(userId)

  if (dailyCount >= FREE_DAILY_LIMIT) {
    return {
      canScan: false,
      reason: `Free users are limited to ${FREE_DAILY_LIMIT} scans per day. Upgrade to Pro for unlimited scans.`,
    }
  }

  return { canScan: true }
}