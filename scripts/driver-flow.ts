import { PrismaClient, RideStatus } from '@prisma/client'

/**
 * Simple driver flow script:
 * - Creates a test driver user (if not exists)
 * - Creates/updates a Driver profile
 * - Creates a Ride for the driver
 *
 * Usage:
 *   npx tsx scripts/driver-flow.ts
 */

const prisma = new PrismaClient()

type CreatedEntities = {
	userId?: string
	driverUserId?: string
	rideId?: string
}

function log(event: string, data: Record<string, unknown> = {}): void {
	console.log(JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }))
}

async function ensureDriverUser(testId: string): Promise<{ id: string; email: string }> {
	const email = `driver-${testId}@test.edu`
	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) return { id: existing.id, email }

	const user = await prisma.user.create({
		data: {
			email,
			name: 'Script Driver',
			phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
			eduVerified: true,
		},
	})
	return { id: user.id, email }
}

async function ensureDriverProfile(userId: string) {
	const existing = await prisma.driver.findUnique({ where: { userId } })
	if (existing) return existing
	return prisma.driver.create({
		data: {
			userId,
			licenseVerified: true,
			studentVerified: true,
			zelleHandle: 'driver@zelle.com',
			cashAppHandle: 'testdriver',
			paymentQrUrl: 'https://example.com/qr/driver-payment.png',
		},
	})
}

async function createRide(driverUserId: string) {
	const departAt = new Date(Date.now() + 2 * 60 * 60 * 1000)
	return prisma.ride.create({
		data: {
			driverId: driverUserId,
			originText: 'Gainesville, FL',
			originLat: 29.6516,
			originLng: -82.3248,
			destText: 'Orlando, FL',
			destLat: 28.5383,
			destLng: -81.3792,
			departAt,
			seatsTotal: 3,
			seatsAvailable: 3,
			totalCostCents: 15000,
			status: RideStatus.open,
		},
	})
}

async function main() {
	const created: CreatedEntities = {}
	const testId = `${Date.now()}`
	log('DRIVER_FLOW_STARTED', { testId })

	try {
		const driverUser = await ensureDriverUser(testId)
		created.userId = driverUser.id
		log('DRIVER_USER_READY', { userId: driverUser.id, email: driverUser.email })

		const driver = await ensureDriverProfile(driverUser.id)
		created.driverUserId = driver.userId
		log('DRIVER_PROFILE_READY', { driverUserId: driver.userId, paymentQrUrl: driver.paymentQrUrl })

		const ride = await createRide(driver.userId)
		created.rideId = ride.id
		log('RIDE_CREATED', { rideId: ride.id, departAt: ride.departAt.toISOString() })

		log('DRIVER_FLOW_COMPLETED', created)
	} catch (error: any) {
		log('DRIVER_FLOW_FAILED', { message: error?.message, stack: error?.stack })
		process.exitCode = 1
	} finally {
		await prisma.$disconnect()
	}
}

void main()


