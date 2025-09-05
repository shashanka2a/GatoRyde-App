import { prisma } from '../client'
import { Verification, CreateVerification, UpdateVerification, VerificationSchema, CreateVerificationSchema, UpdateVerificationSchema, VerificationType, VerificationStatus } from '../types'

export class VerificationRepository {
  async create(data: CreateVerification): Promise<Verification> {
    const validatedData = CreateVerificationSchema.parse(data)
    const verification = await prisma.verification.create({
      data: validatedData,
    })
    return VerificationSchema.parse(verification)
  }

  async findById(id: string): Promise<Verification | null> {
    const verification = await prisma.verification.findUnique({
      where: { id },
    })
    return verification ? VerificationSchema.parse(verification) : null
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<Verification[]> {
    const verifications = await prisma.verification.findMany({
      where: { userId },
      take: limit,
      skip: offset,
    })
    return verifications.map(verification => VerificationSchema.parse(verification))
  }

  async findByUserIdAndType(userId: string, type: VerificationType): Promise<Verification | null> {
    const verification = await prisma.verification.findFirst({
      where: { userId, type },
      orderBy: { id: 'desc' },
    })
    return verification ? VerificationSchema.parse(verification) : null
  }

  async update(id: string, data: UpdateVerification): Promise<Verification> {
    const validatedData = UpdateVerificationSchema.parse(data)
    const verification = await prisma.verification.update({
      where: { id },
      data: validatedData,
    })
    return VerificationSchema.parse(verification)
  }

  async delete(id: string): Promise<void> {
    await prisma.verification.delete({
      where: { id },
    })
  }

  async updateStatus(id: string, status: VerificationStatus, notes?: string): Promise<Verification> {
    const verification = await prisma.verification.update({
      where: { id },
      data: { status, notes },
    })
    return VerificationSchema.parse(verification)
  }

  async findByStatus(status: VerificationStatus, limit = 50, offset = 0): Promise<Verification[]> {
    const verifications = await prisma.verification.findMany({
      where: { status },
      take: limit,
      skip: offset,
    })
    return verifications.map(verification => VerificationSchema.parse(verification))
  }

  async findByType(type: VerificationType, limit = 50, offset = 0): Promise<Verification[]> {
    const verifications = await prisma.verification.findMany({
      where: { type },
      take: limit,
      skip: offset,
    })
    return verifications.map(verification => VerificationSchema.parse(verification))
  }

  async findPendingVerifications(limit = 50): Promise<Verification[]> {
    const verifications = await prisma.verification.findMany({
      where: { status: 'pending' },
      take: limit,
    })
    return verifications.map(verification => VerificationSchema.parse(verification))
  }

  async approve(id: string, notes?: string): Promise<Verification> {
    return this.updateStatus(id, 'approved', notes)
  }

  async reject(id: string, notes?: string): Promise<Verification> {
    return this.updateStatus(id, 'rejected', notes)
  }

  async isUserVerified(userId: string, type: VerificationType): Promise<boolean> {
    const verification = await this.findByUserIdAndType(userId, type)
    return verification?.status === 'approved'
  }
}