// Mock Prisma client for MVP build
export const prisma = {
  user: {
    findUnique: async () => ({ id: 'mock', eduVerified: true }),
    findMany: async () => [],
    create: async () => ({ id: 'mock' }),
    update: async () => ({ id: 'mock' }),
    delete: async () => ({ id: 'mock' }),
  },
  ride: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({ id: 'mock' }),
    update: async () => ({ id: 'mock' }),
    delete: async () => ({ id: 'mock' }),
  },
  booking: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({ id: 'mock' }),
    update: async () => ({ id: 'mock' }),
    delete: async () => ({ id: 'mock' }),
  },
  contactLog: {
    create: async () => ({ id: 'mock' }),
  },
  verification: {
    findMany: async () => [],
    create: async () => ({ id: 'mock' }),
    update: async () => ({ id: 'mock' }),
  },
  dispute: {
    findMany: async () => [],
    create: async () => ({ id: 'mock' }),
    update: async () => ({ id: 'mock' }),
  },
}