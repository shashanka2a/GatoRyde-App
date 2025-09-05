import { prisma } from '../client'
import { Vehicle, CreateVehicle, UpdateVehicle, VehicleSchema, CreateVehicleSchema, UpdateVehicleSchema } from '../types'

export class VehicleRepository {
  async create(data: CreateVehicle): Promise<Vehicle> {
    const validatedData = CreateVehicleSchema.parse(data)
    const vehicle = await prisma.vehicle.create({
      data: validatedData,
    })
    return VehicleSchema.parse(vehicle)
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })
    return vehicle ? VehicleSchema.parse(vehicle) : null
  }

  async findByUserId(userId: string): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
    })
    return vehicles.map(vehicle => VehicleSchema.parse(vehicle))
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { plate },
    })
    return vehicle ? VehicleSchema.parse(vehicle) : null
  }

  async update(id: string, data: UpdateVehicle): Promise<Vehicle> {
    const validatedData = UpdateVehicleSchema.parse(data)
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: validatedData,
    })
    return VehicleSchema.parse(vehicle)
  }

  async delete(id: string): Promise<void> {
    await prisma.vehicle.delete({
      where: { id },
    })
  }

  async findMany(limit = 50, offset = 0): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({
      take: limit,
      skip: offset,
    })
    return vehicles.map(vehicle => VehicleSchema.parse(vehicle))
  }

  async findByMakeModel(make: string, model: string, limit = 50): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        make: { contains: make, mode: 'insensitive' },
        model: { contains: model, mode: 'insensitive' },
      },
      take: limit,
    })
    return vehicles.map(vehicle => VehicleSchema.parse(vehicle))
  }

  async findBySeats(minSeats: number, limit = 50): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        seats: { gte: minSeats },
      },
      take: limit,
    })
    return vehicles.map(vehicle => VehicleSchema.parse(vehicle))
  }
}