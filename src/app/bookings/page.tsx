import CustomerBookings from '@/components/restaurants/CustomerBookings';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Bookings | Anli',
    description: 'View and manage your restaurant reservations.',
};

export default function BookingsPage() {
    return <CustomerBookings />;
}
