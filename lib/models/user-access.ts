import prisma from './prisma'

export async function getUserAccessInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true },
      },
    },
  })

  const latestSub = user?.subscriptions?.[0]

  return {
    role: user?.role ?? 'free',
    isPro: latestSub?.status === 'active',
  }
}