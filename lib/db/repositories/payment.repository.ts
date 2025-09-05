import { prisma } from '../client'
import { Payment, CreatePayment, UpdatePayment, PaymentSchema, CreatePaymentSchema, UpdatePaymentSchema } from '../types'

export class PaymentRepository {
  async create(data: CreatePayment): Promise<Payment> {
    const validatedData = CreatePaymentSchema.parse(data)
    const payment = await prisma.payment.create({
      data: validatedData,
    })
    return PaymentSchema.parse(payment)
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    })
    return payment ? PaymentSchema.parse(payment) : null
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
    })
    return payment ? PaymentSchema.parse(payment) : null
  }

  async findByStripePaymentIntent(stripePaymentIntent: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntent },
    })
    return payment ? PaymentSchema.parse(payment) : null
  }

  async update(id: string, data: UpdatePayment): Promise<Payment> {
    const validatedData = UpdatePaymentSchema.parse(data)
    const payment = await prisma.payment.update({
      where: { id },
      data: validatedData,
    })
    return PaymentSchema.parse(payment)
  }

  async delete(id: string): Promise<void> {
    await prisma.payment.delete({
      where: { id },
    })
  }

  async authorize(id: string): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id },
      data: { authorizedAt: new Date() },
    })
    return PaymentSchema.parse(payment)
  }

  async capture(id: string): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id },
      data: { capturedAt: new Date() },
    })
    return PaymentSchema.parse(payment)
  }

  async setRefundStatus(id: string, refundStatus: string): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id },
      data: { refundStatus },
    })
    return PaymentSchema.parse(payment)
  }

  async findPendingCaptures(limit = 50): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: {
        authorizedAt: { not: null },
        capturedAt: null,
      },
      take: limit,
    })
    return payments.map(payment => PaymentSchema.parse(payment))
  }

  async findByDateRange(startDate: Date, endDate: Date, limit = 50): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: {
        authorizedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      take: limit,
      orderBy: { authorizedAt: 'desc' },
    })
    return payments.map(payment => PaymentSchema.parse(payment))
  }
}