import { prisma } from '../client'
import { Dispute, CreateDispute, UpdateDispute, DisputeSchema, CreateDisputeSchema, UpdateDisputeSchema, DisputeStatus } from '../types'

export class DisputeRepository {
  async create(data: CreateDispute): Promise<Dispute> {
    const validatedData = CreateDisputeSchema.parse(data)
    const dispute = await prisma.dispute.create({
      data: validatedData,
    })
    return DisputeSchema.parse(dispute)
  }

  async findById(id: string): Promise<Dispute | null> {
    const dispute = await prisma.dispute.findUnique({
      where: { id },
    })
    return dispute ? DisputeSchema.parse(dispute) : null
  }

  async findByBookingId(bookingId: string): Promise<Dispute[]> {
    const disputes = await prisma.dispute.findMany({
      where: { bookingId },
    })
    return disputes.map(dispute => DisputeSchema.parse(dispute))
  }

  async findByOpenedById(openedById: string, limit = 50, offset = 0): Promise<Dispute[]> {
    const disputes = await prisma.dispute.findMany({
      where: { openedById },
      take: limit,
      skip: offset,
    })
    return disputes.map(dispute => DisputeSchema.parse(dispute))
  }

  async update(id: string, data: UpdateDispute): Promise<Dispute> {
    const validatedData = UpdateDisputeSchema.parse(data)
    const dispute = await prisma.dispute.update({
      where: { id },
      data: validatedData,
    })
    return DisputeSchema.parse(dispute)
  }

  async delete(id: string): Promise<void> {
    await prisma.dispute.delete({
      where: { id },
    })
  }

  async updateStatus(id: string, status: DisputeStatus, resolution?: string): Promise<Dispute> {
    const dispute = await prisma.dispute.update({
      where: { id },
      data: { status, resolution },
    })
    return DisputeSchema.parse(dispute)
  }

  async findByStatus(status: DisputeStatus, limit = 50, offset = 0): Promise<Dispute[]> {
    const disputes = await prisma.dispute.findMany({
      where: { status },
      take: limit,
      skip: offset,
    })
    return disputes.map(dispute => DisputeSchema.parse(dispute))
  }

  async findOpenDisputes(limit = 50): Promise<Dispute[]> {
    const disputes = await prisma.dispute.findMany({
      where: { status: 'open' },
      take: limit,
    })
    return disputes.map(dispute => DisputeSchema.parse(dispute))
  }

  async resolve(id: string, resolution: string): Promise<Dispute> {
    return this.updateStatus(id, 'resolved', resolution)
  }

  async reject(id: string, resolution?: string): Promise<Dispute> {
    return this.updateStatus(id, 'rejected', resolution)
  }

  async hasActiveDispute(bookingId: string): Promise<boolean> {
    const dispute = await prisma.dispute.findFirst({
      where: {
        bookingId,
        status: 'open',
      },
    })
    return !!dispute
  }
}