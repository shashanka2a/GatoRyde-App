import { prisma } from '../client'
import { Ride, CreateRide, UpdateRide, RideSchema, CreateRideSchema, UpdateRideSchema, RideStatus } from '../types'

export class RideRepository {
  async create(data: CreateRide): Promise<Ride> {
    const validatedData = CreateRideSchema.parse(data)
    const ride = await prisma.ride.create({
      data: {
        ...validatedData,
        seatsAvailable: validatedData.seatsTotal,
      },
    })
    return RideSchema.parse(ride)
  }

  async findById(id: string): Promise<Ride | null> {
    const ride = await prisma.ride.findUnique({
      where: { id },
    })
    return ride ? RideSchema.parse(ride) : null
  }

  async findByDriverId(driverId: string, limit = 50, offset = 0): Promise<Ride[]> {
    const rides = await prisma.ride.findMany({
      where: { driverId },
      take: limit,
      skip: offset,
      orderBy: { departAt: 'desc' },
    })
    return rides.map(ride => RideSchema.parse(ride))
  }

  async update(id: string, data: UpdateRide): Promise<Ride> {
    const validatedData = UpdateRideSchema.parse(data)
    const ride = await prisma.ride.update({
      where: { id },
      data: validatedData,
    })
    return RideSchema.parse(ride)
  }

  async delete(id: string): Promise<void> {
    await prisma.ride.delete({
      where: { id },
    })
  }

  async findAvailable(limit = 50, offset = 0): Promise<Ride[]> {
    const rides = await prisma.ride.findMany({
      where: {
        status: 'open',
        seatsAvailable: { gt: 0 },
        departAt: { gt: new Date() },
      },
      take: limit,
      skip: offset,
      orderBy: { departAt: 'asc' },
    })
    return rides.map(ride => RideSchema.parse(ride))
  }

  async findByRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    radiusKm = 5,
    limit = 50
  ): Promise<Ride[]> {
    // Simple distance calculation - in production, use PostGIS or similar
    const latDelta = radiusKm / 111.32 // Rough conversion
    const lngDelta = radiusKm / (111.32 * Math.cos(originLat * Math.PI / 180))

    const rides = await prisma.ride.findMany({
      where: {
        status: 'open',
        seatsAvailable: { gt: 0 },
        departAt: { gt: new Date() },
        originLat: {
          gte: originLat - latDelta,
          lte: originLat + latDelta,
        },
        originLng: {
          gte: originLng - lngDelta,
          lte: originLng + lngDelta,
        },
        destLat: {
          gte: destLat - latDelta,
          lte: destLat + latDelta,
        },
        destLng: {
          gte: destLng - lngDelta,
          lte: destLng + lngDelta,
        },
      },
      take: limit,
      orderBy: { departAt: 'asc' },
    })
    return rides.map(ride => RideSchema.parse(ride))
  }

  async updateStatus(id: string, status: RideStatus): Promise<Ride> {
    const ride = await prisma.ride.update({
      where: { id },
      data: { status },
    })
    return RideSchema.parse(ride)
  }

  async updateSeatsAvailable(id: string, seatsBooked: number): Promise<Ride> {
    const ride = await prisma.ride.update({
      where: { id },
      data: {
        seatsAvailable: { decrement: seatsBooked },
      },
    })

    // Update status to full if no seats available
    if (ride.seatsAvailable <= 0) {
      return this.updateStatus(id, 'full')
    }

    return RideSchema.parse(ride)
  }

  async findByDateRange(startDate: Date, endDate: Date, limit = 50): Promise<Ride[]> {
    const rides = await prisma.ride.findMany({
      where: {
        departAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      take: limit,
      orderBy: { departAt: 'asc' },
    })
    return rides.map(ride => RideSchema.parse(ride))
  }
}