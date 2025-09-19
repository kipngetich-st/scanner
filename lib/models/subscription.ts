import prisma from '@/lib/models/prisma'

export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }, // latest subscription
  })
}

export async function isUserPro(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription?.status === 'active'
}

export async function getUserRole(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  return user?.role ?? 'free'
}