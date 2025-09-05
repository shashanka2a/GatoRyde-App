'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'
import { NotificationQueue } from '@/lib/notifications/queue'
import { NotificationTemplates } from '@/lib/notifications/templates'
import { z } from 'zod'

export interface CancelBookingResult {
    success: boolean
    message: string
    errors?: Record<string, string>
}

export interface OpenDisputeResult {
    success: boolean
    message: string
    disputeId?: string
    errors?: Record<string, string>
}

const CancelBookingSchema = z.object({
    bookingId: z.string().cuid(),
    actor: z.enum(['rider', 'driver']),
})

const OpenDisputeSchema = z.object({
    bookingId: z.string().cuid(),
    reason: z.string().min(10, 'Dispute reason must be at least 10 characters'),
})

export async function cancelBooking(
    bookingId: string,
    actor: 'rider' | 'driver'
): Promise<CancelBookingResult> {
    try {
        // Get authenticated user
        const session = await requireAuth()
        const userId = session.user.id

        // Validate input
        const validatedData = CancelBookingSchema.parse({ bookingId, actor })

        // Get booking with ride and user info
        const booking = await prisma.booking.findUnique({
            where: { id: validatedData.bookingId },
            include: {
                ride: {
                    include: {
                        driver: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        phone: true,
                                    }
                                }
                            }
                        }
                    }
                },
                rider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        })

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                errors: { booking: 'Invalid booking ID' }
            }
        }

        // Verify user authorization
        const isRider = booking.riderId === userId
        const isDriver = booking.ride.driverId === userId

        if (!isRider && !isDriver) {
            return {
                success: false,
                message: 'You are not authorized to cancel this booking',
                errors: { auth: 'Unauthorized' }
            }
        }

        // Verify actor matches user role
        if ((actor === 'rider' && !isRider) || (actor === 'driver' && !isDriver)) {
            return {
                success: false,
                message: 'Actor type does not match your role in this booking',
                errors: { actor: 'Invalid actor type' }
            }
        }

        // Check if booking can be cancelled
        if (!['authorized', 'confirmed'].includes(booking.status)) {
            return {
                success: false,
                message: 'This booking cannot be cancelled in its current state',
                errors: { status: 'Cannot cancel booking' }
            }
        }

        // Calculate time until departure (in UTC, as stored in database)
        const now = new Date()
        const departAt = booking.ride.departAt
        const hoursUntilDeparture = (departAt.getTime() - now.getTime()) / (1000 * 60 * 60)

        let shouldTagLateCancellation = false
        let shouldChargeEtiquettePayment = false
        let notificationMessage = ''

        if (actor === 'rider') {
            if (hoursUntilDeparture < 12) {
                // Rider cancelling <12h: tag 'late-cancel', still owes etiquette payment
                shouldTagLateCancellation = true
                shouldChargeEtiquettePayment = true
                notificationMessage = 'Please notify driver ASAP'
            }
        }

        // Update booking and restore seats in transaction
        await prisma.$transaction(async (tx) => {
            // Update booking status
            const updateData: any = {
                status: 'cancelled' as const,
                cancelledAt: now,
                cancelledBy: userId,
            }

            if (shouldTagLateCancellation) {
                updateData.tags = ['late-cancel']
                updateData.etiquettePaymentDue = shouldChargeEtiquettePayment
            }

            await tx.booking.update({
                where: { id: validatedData.bookingId },
                data: updateData
            })

            // Restore seats to ride
            await tx.ride.update({
                where: { id: booking.rideId },
                data: {
                    seatsAvailable: { increment: booking.seats },
                    status: 'open' // Ride becomes available again
                }
            })
        })

        // Queue notifications
        const riderName = booking.rider.name || 'Rider'
        const driverName = booking.ride.driver.user.name || 'Driver'

        const templateData = {
            riderName,
            driverName,
            originText: booking.ride.originText,
            destText: booking.ride.destText,
            departAt: booking.ride.departAt,
            seats: booking.seats,
            reason: shouldTagLateCancellation ? 'Late cancellation' : undefined,
        }

        if (actor === 'driver') {
            // Driver cancels: email all riders with apology template + one-click re-search
            await NotificationQueue.enqueue({
                type: 'booking_cancelled',
                channel: 'email',
                recipientId: booking.riderId,
                recipientEmail: booking.rider.email,
                bookingId: validatedData.bookingId,
                templateData: {
                    ...templateData,
                    isDriverCancellation: true,
                    apologyMessage: 'We sincerely apologize for the inconvenience. Please use the link below to search for alternative rides.',
                    reSearchUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/rides?origin=${encodeURIComponent(booking.ride.originText)}&destination=${encodeURIComponent(booking.ride.destText)}&date=${booking.ride.departAt.toISOString().split('T')[0]}`
                }
            })
        } else {
            // Rider cancels: notify driver
            let emailContent = `${riderName} has cancelled their booking.`
            if (notificationMessage) {
                emailContent += ` ${notificationMessage}`
            }

            await NotificationQueue.enqueue({
                type: 'booking_cancelled',
                channel: 'email',
                recipientId: booking.ride.driverId,
                recipientEmail: booking.ride.driver.user.email,
                bookingId: validatedData.bookingId,
                templateData: {
                    ...templateData,
                    isRiderCancellation: true,
                    additionalMessage: notificationMessage,
                }
            })
        }

        revalidatePath('/dashboard/bookings')
        revalidatePath('/dashboard/rides')
        revalidatePath('/rides')

        let successMessage = 'Booking cancelled successfully'
        if (shouldTagLateCancellation) {
            successMessage += '. Note: Late cancellation fee may apply.'
        }
        if (notificationMessage) {
            successMessage += ` ${notificationMessage}`
        }

        return {
            success: true,
            message: successMessage,
        }

    } catch (error) {
        console.error('Cancel booking error:', error)

        if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {}
            error.errors.forEach((err) => {
                const path = err.path.join('.')
                errors[path] = err.message
            })
            return {
                success: false,
                message: 'Invalid cancellation request',
                errors
            }
        }

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to cancel booking',
            errors: { form: 'Cancellation failed' }
        }
    }
}

export async function openDispute(
    bookingId: string,
    reason: string
): Promise<OpenDisputeResult> {
    try {
        // Get authenticated user
        const session = await requireAuth()
        const userId = session.user.id

        // Validate input
        const validatedData = OpenDisputeSchema.parse({ bookingId, reason })

        // Get booking with ride and user info
        const booking = await prisma.booking.findUnique({
            where: { id: validatedData.bookingId },
            include: {
                ride: {
                    include: {
                        driver: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        phone: true,
                                    }
                                }
                            }
                        }
                    }
                },
                rider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        })

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                errors: { booking: 'Invalid booking ID' }
            }
        }

        // Verify user is either rider or driver
        const isRider = booking.riderId === userId
        const isDriver = booking.ride.driverId === userId

        if (!isRider && !isDriver) {
            return {
                success: false,
                message: 'You are not authorized to dispute this booking',
                errors: { auth: 'Unauthorized' }
            }
        }

        // Check if booking is in a state that can be disputed
        if (!['completed', 'cancelled'].includes(booking.status)) {
            return {
                success: false,
                message: 'This booking cannot be disputed in its current state',
                errors: { status: 'Cannot dispute booking' }
            }
        }

        // Check if dispute already exists
        const existingDispute = await prisma.dispute.findFirst({
            where: {
                bookingId: validatedData.bookingId,
                status: 'open'
            }
        })

        if (existingDispute) {
            return {
                success: false,
                message: 'A dispute is already open for this booking',
                errors: { dispute: 'Duplicate dispute' }
            }
        }

        // Get last contact logs and email bodies if available
        const contactLogs = await prisma.contactLog.findMany({
            where: { bookingId: validatedData.bookingId },
            orderBy: { createdAt: 'desc' },
            take: 10 // Get last 10 contact logs
        })

        // Create dispute with attached contact logs
        const dispute = await prisma.dispute.create({
            data: {
                bookingId: validatedData.bookingId,
                openedById: userId,
                reason: validatedData.reason,
                status: 'open',
                contactLogsSnapshot: contactLogs, // Store contact logs as JSON
            }
        })

        // Update booking status to disputed
        await prisma.booking.update({
            where: { id: validatedData.bookingId },
            data: {
                status: 'disputed'
            }
        })

        // Queue notifications to both parties
        const riderName = booking.rider.name || 'Rider'
        const driverName = booking.ride.driver.user.name || 'Driver'
        const disputeOpenerName = isRider ? riderName : driverName

        const templateData = {
            riderName,
            driverName,
            disputeOpenerName,
            originText: booking.ride.originText,
            destText: booking.ride.destText,
            departAt: booking.ride.departAt,
            seats: booking.seats,
            disputeReason: validatedData.reason,
        }

        // Notify rider (if they didn't open the dispute)
        if (!isRider) {
            await NotificationQueue.enqueue({
                type: 'booking_disputed',
                channel: 'email',
                recipientId: booking.riderId,
                recipientEmail: booking.rider.email,
                bookingId: validatedData.bookingId,
                templateData
            })
        }

        // Notify driver (if they didn't open the dispute)
        if (!isDriver) {
            await NotificationQueue.enqueue({
                type: 'booking_disputed',
                channel: 'email',
                recipientId: booking.ride.driverId,
                recipientEmail: booking.ride.driver.user.email,
                bookingId: validatedData.bookingId,
                templateData
            })
        }

        // TODO: Notify admin dashboard about new dispute
        // This could be implemented as a webhook or admin notification system

        revalidatePath('/dashboard/bookings')
        revalidatePath('/dashboard/disputes')

        return {
            success: true,
            message: 'Dispute opened successfully. Our support team will review and contact you within 24-48 hours.',
            disputeId: dispute.id,
        }

    } catch (error) {
        console.error('Open dispute error:', error)

        if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {}
            error.errors.forEach((err) => {
                const path = err.path.join('.')
                errors[path] = err.message
            })
            return {
                success: false,
                message: 'Invalid dispute request',
                errors
            }
        }

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to open dispute',
            errors: { form: 'Dispute creation failed' }
        }
    }
}