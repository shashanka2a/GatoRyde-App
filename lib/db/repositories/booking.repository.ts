import { prisma } from '../client'
import { Booking, CreateBooking, UpdateBooking, BookingSchema, CreateBookingSchema, UpdateBookingSchema, BookingStatus } from '../types'

export class BookingRepository {
  async create(data: CreateBooking): Promise<Booking> {
    const validatedData = CreateBookingSchema.parse(data)
    const booking = await prisma.booking.create({
      data: validatedData,
    })
    return BookingSchema.parse(booking)
  }

  async findById(id: string): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
    })
    return booking ? BookingSchema.parse(booking) : null
  }

  async findByRideId(rideId: string, limit = 50, offset = 0): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      where: { rideId },
      take: limit,
      skip: offset,
    })
    return bookings.map(booking => BookingSchema.parse(booking))
  }

  async findByRiderId(riderId: string, limit = 50, offset = 0): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      where: { riderId },
      take: limit,
      skip: offset,
      orderBy: { tripStartedAt: 'desc' },
    })
    return bookings.map(booking => BookingSchema.parse(booking))
  }

  async update(id: string, data: UpdateBooking): Promise<Booking> {
    const validatedData = UpdateBookingSchema.parse(data)
    const booking = await prisma.booking.update({
      where: { id },
      data: validatedData,
    })
    return BookingSchema.parse(booking)
  }

  async delete(id: string): Promise<void> {
    await prisma.booking.delete({
      where: { id },
    })
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    })
    return BookingSchema.parse(booking)
  }

  async startTrip(id: string, otp: string): Promise<Booking> {
    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.tripStartOtp !== otp) {
      throw new Error('Invalid OTP')
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'in_progress',
        tripStartedAt: new Date(),
      },
    })

    return BookingSchema.parse(updatedBooking)
  }

  async completeTrip(id: string): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'completed',
        tripCompletedAt: new Date(),
      },
    })
    return BookingSchema.parse(booking)
  }

  async generateTripStartOtp(id: string): Promise<Booking> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const booking = await prisma.booking.update({
      where: { id },
      data: { tripStartOtp: otp },
    })
    return BookingSchema.parse(booking)
  }

  async findByStatus(status: BookingStatus, limit = 50, offset = 0): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      where: { status },
      take: limit,
      skip: offset,
    })
    return bookings.map(booking => BookingSchema.parse(booking))
  }

  async findActiveBookings(riderId: string): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        riderId,
        status: { in: ['confirmed', 'in_progress'] },
      },
    })
    return bookings.map(booking => BookingSchema.parse(booking))
  }

  async findUpcomingBookings(riderId: string, limit = 10): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        riderId,
        status: { in: ['confirmed', 'authorized'] },
      },
      include: {
        ride: true,
      },
      take: limit,
      orderBy: {
        ride: {
          departAt: 'asc',
        },
      },
    })
    return bookings.map(booking => BookingSchema.parse(booking))
  }
}