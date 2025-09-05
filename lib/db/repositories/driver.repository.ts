import { prisma } from '../client'
import { Driver, CreateDriver, UpdateDriver, DriverSchema, CreateDriverSchema, UpdateDriverSchema } from '../types'

export class DriverRepository {
  async create(data: CreateDriver): Promise<Driver> {
    const validatedData = CreateDriverSchema.parse(data)
    const driver = await prisma.driver.create({
      data: validatedData,
    })
    return DriverSchema.parse(driver)
  }

  async findByUserId(userId: string): Promise<Driver | null> {
    const driver = await prisma.driver.findUnique({
      where: { userId },
    })
    return driver ? DriverSchema.parse(driver) : null
  }

  async findByLicenseNumber(licenseNumber: string): Promise<Driver | null> {
    const driver = await prisma.driver.findUnique({
      where: { licenseNumber },
    })
    return driver ? DriverSchema.parse(driver) : null
  }

  async update(userId: string, data: UpdateDriver): Promise<Driver> {
    const validatedData = UpdateDriverSchema.parse(data)
    const driver = await prisma.driver.update({
      where: { userId },
      data: validatedData,
    })
    return DriverSchema.parse(driver)
  }

  async delete(userId: string): Promise<void> {
    await prisma.driver.delete({
      where: { userId },
    })
  }

  async findMany(limit = 50, offset = 0): Promise<Driver[]> {
    const drivers = await prisma.driver.findMany({
      take: limit,
      skip: offset,
    })
    return drivers.map(driver => DriverSchema.parse(driver))
  }

  async findVerified(limit = 50, offset = 0): Promise<Driver[]> {
    const drivers = await prisma.driver.findMany({
      where: { verified: true },
      take: limit,
      skip: offset,
    })
    return drivers.map(driver => DriverSchema.parse(driver))
  }

  async verify(userId: string): Promise<Driver> {
    const driver = await prisma.driver.update({
      where: { userId },
      data: { verified: true },
    })
    return DriverSchema.parse(driver)
  }

  async setStripeAccount(userId: string, stripeAccountId: string): Promise<Driver> {
    const driver = await prisma.driver.update({
      where: { userId },
      data: { stripeAccountId },
    })
    return DriverSchema.parse(driver)
  }

  async setVehicle(userId: string, vehicleId: string): Promise<Driver> {
    const driver = await prisma.driver.update({
      where: { userId },
      data: { vehicleId },
    })
    return DriverSchema.parse(driver)
  }
}