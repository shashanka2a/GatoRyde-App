import { prisma } from '../client'
import { Message, CreateMessage, MessageSchema, CreateMessageSchema } from '../types'

export class MessageRepository {
  async create(data: CreateMessage): Promise<Message> {
    const validatedData = CreateMessageSchema.parse(data)
    const message = await prisma.message.create({
      data: validatedData,
    })
    return MessageSchema.parse(message)
  }

  async findById(id: string): Promise<Message | null> {
    const message = await prisma.message.findUnique({
      where: { id },
    })
    return message ? MessageSchema.parse(message) : null
  }

  async findByBookingId(bookingId: string, limit = 50, offset = 0): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { bookingId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'asc' },
    })
    return messages.map(message => MessageSchema.parse(message))
  }

  async findByUserId(fromUserId: string, limit = 50, offset = 0): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { fromUserId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })
    return messages.map(message => MessageSchema.parse(message))
  }

  async delete(id: string): Promise<void> {
    await prisma.message.delete({
      where: { id },
    })
  }

  async findConversation(bookingId: string, limit = 100): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { bookingId },
      take: limit,
      orderBy: { createdAt: 'asc' },
    })
    return messages.map(message => MessageSchema.parse(message))
  }

  async findRecentMessages(bookingId: string, since: Date): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: {
        bookingId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'asc' },
    })
    return messages.map(message => MessageSchema.parse(message))
  }

  async countUnreadMessages(bookingId: string, userId: string, since: Date): Promise<number> {
    return await prisma.message.count({
      where: {
        bookingId,
        fromUserId: { not: userId },
        createdAt: { gte: since },
      },
    })
  }
}