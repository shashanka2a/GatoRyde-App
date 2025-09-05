import { prisma } from '../client'
import { User, CreateUser, UpdateUser, UserSchema, CreateUserSchema, UpdateUserSchema } from '../types'

export class UserRepository {
  async create(data: CreateUser): Promise<User> {
    const validatedData = CreateUserSchema.parse(data)
    const user = await prisma.user.create({
      data: validatedData,
    })
    return UserSchema.parse(user)
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    return user ? UserSchema.parse(user) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user ? UserSchema.parse(user) : null
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { phone },
    })
    return user ? UserSchema.parse(user) : null
  }

  async update(id: string, data: UpdateUser): Promise<User> {
    const validatedData = UpdateUserSchema.parse(data)
    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
    })
    return UserSchema.parse(user)
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }

  async findMany(limit = 50, offset = 0): Promise<User[]> {
    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })
    return users.map(user => UserSchema.parse(user))
  }

  async updateRating(id: string, newRating: number): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { ratingAvg: true, ratingCount: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const currentAvg = user.ratingAvg ?? 0
    const currentCount = user.ratingCount
    const newCount = currentCount + 1
    const newAvg = (currentAvg * currentCount + newRating) / newCount

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ratingAvg: newAvg,
        ratingCount: newCount,
      },
    })

    return UserSchema.parse(updatedUser)
  }

  async verifyEducation(id: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: { eduVerified: true },
    })
    return UserSchema.parse(user)
  }
}