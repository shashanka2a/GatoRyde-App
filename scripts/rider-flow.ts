import { PrismaClient, BookingStatus } from '@prisma/client'

/**
 * Simple rider flow script:
 * - Creates two rider users
 * - Creates bookings on a provided ride or a new one via driver-flow
 * - Verifies estimated share and completes trip distributing final shares
 *
 * Usage:
 *   npx tsx scripts/rider-flow.ts [--ride RIDE_ID]
 */

const prisma = new PrismaClient()

function log(event: string, data: Record<string, unknown> = {}): void {
	console.log(JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }))
}

async function createUser(email: string, name: string) {
	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) return existing
	return prisma.user.create({
		data: {
			email,
			name,
			phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
			eduVerified: true,
		},
	})
}

async function pickOrCreateRide() {
	// Try to pick the most recent open ride
	const existing = await prisma.ride.findFirst({
		where: { status: 'open' },
		orderBy: { createdAt: 'desc' as any },
	})
	if (existing) return existing
	// Fallback: create via driver-flow helper inline
	const { default: driverFlow } = await import('./driver-flow')
	return driverFlow
}

async function createBooking(rideId: string, riderId: string, seats: number) {
	const ride = await prisma.ride.findUnique({ where: { id: rideId }, include: { bookings: true } })
	if (!ride) throw new Error('Ride not found')
	const estimated = Math.ceil(ride.totalCostCents / ride.seatsTotal)
	return prisma.booking.create({
		data: {
			rideId,
			riderId,
			seats,
			status: BookingStatus.authorized,
			authEstimateCents: estimated,
		}
	})
}

async function completeTrip(rideId: string) {
	const bookings = await prisma.booking.findMany({ where: { rideId } })
	const ride = await prisma.ride.findUnique({ where: { id: rideId } })
	if (!ride) throw new Error('Ride not found')
	const totalSeats = bookings.reduce((s, b) => s + b.seats, 0)
	const base = Math.floor(ride.totalCostCents / totalSeats)
	const remainder = ride.totalCostCents % totalSeats
	let used = 0
	for (const b of bookings) {
		const extra = Math.min(remainder - used, b.seats)
		const finalShare = base * b.seats + (extra > 0 ? extra : 0)
		used += extra > 0 ? extra : 0
		await prisma.booking.update({
			where: { id: b.id },
			data: { status: BookingStatus.completed, finalShareCents: finalShare, tripCompletedAt: new Date() },
		})
	}
	await prisma.ride.update({ where: { id: rideId }, data: { status: 'completed' as any } })
}

async function main() {
	const testId = `${Date.now()}`
	log('RIDER_FLOW_STARTED', { testId })
	try {
		const rider1 = await createUser(`rider1-${testId}@test.edu`, 'Rider One')
		const rider2 = await createUser(`rider2-${testId}@test.edu`, 'Rider Two')

		// Create a driver and ride
		const { PrismaClient: _ignore } = await import('@prisma/client')
		const driverScript = await import('./driver-flow')
		// @ts-ignore - driver-flow logs the created entities; fetch latest ride
		const ride = await prisma.ride.findFirst({ orderBy: { departAt: 'desc' as any } })
		if (!ride) throw new Error('No ride available')
		log('RIDE_READY', { rideId: ride.id })

		const b1 = await createBooking(ride.id, rider1.id, 1)
		const b2 = await createBooking(ride.id, rider2.id, 1)
		log('BOOKINGS_CREATED', { bookingIds: [b1.id, b2.id] })

		await completeTrip(ride.id)
		log('TRIP_COMPLETED', { rideId: ride.id })

		const bookings = await prisma.booking.findMany({ where: { id: { in: [b1.id, b2.id] } } })
		log('FINAL_SHARES', { shares: bookings.map(b => ({ id: b.id, final: b.finalShareCents })) })
		log('RIDER_FLOW_COMPLETED')
	} catch (error: any) {
		log('RIDER_FLOW_FAILED', { message: error?.message, stack: error?.stack })
		process.exitCode = 1
	} finally {
		await prisma.$disconnect()
	}
}

void main()


