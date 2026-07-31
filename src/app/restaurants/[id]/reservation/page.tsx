import RestaurantDetail from '@/components/restaurants/RestaurantDetail';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: 'Table Reservation | Anli',
    description: 'Select your reservation preferences.',
};

export default async function ReservationPage({ params }: Props) {
    const { id } = await params;
    
    // The reservation UI seems to be part of the detail page or a sub-section
    // For now we'll just render the detail page which has the booking slots
    return <RestaurantDetail id={id} />;
}
