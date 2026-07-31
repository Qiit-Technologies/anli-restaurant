import { z } from 'zod';

export const bookingFormSchema = z.object({
    customerDetails: z.object({
        title: z.string().optional(),
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address'),
        phone: z
            .string()
            .min(1, 'Phone number is required')
            .refine(
                (value) => value.replace(/\D/g, '').length >= 10,
                'Enter a valid phone number',
            ),
        specialRequests: z.string(),
    }),
    bookingDetails: z.object({
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().min(1, 'End date is required'),
        reservationTime: z.string().min(1, 'Reservation time is required'),
        roomType: z.string().min(1, 'Room type is required'),
        numGuests: z.string(),
        numNights: z.string(),
    }),
    paymentMethod: z
        .object({
            paymentOption: z.enum(['paystack', 'bank-transfer'], {
                errorMap: () => ({ message: 'Please select a payment method' }),
            }),
            accountToPay: z.string().optional(),
        })
        .refine(
            (data) => {
                if (data.paymentOption === 'bank-transfer' && !data.accountToPay) {
                    return false;
                }
                return true;
            },
            {
                message: 'Please select a bank account for the transfer',
                path: ['accountToPay'],
            },
        ),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
