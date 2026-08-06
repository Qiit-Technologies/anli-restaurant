import ReservationHeader from '@/components/reservation/ReservationHeader';
import ReservationMap from '@/components/reservation/ReservationMap';
import ReservationFormClient from '@/components/reservation/ReservationFormClient';
import { Metadata } from 'next';
import { restaurantService } from '@/services/restaurant.service';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: 'Table Reservation | Anli',
    description: 'Select your reservation preferences.',
};

export default async function ReservationPage({ params }: Props) {
    const { id } = await params;
    
    let restaurant;
    try {
        restaurant = await restaurantService.getDetails(Number(id));
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        return notFound();
    }

    if (!restaurant) return notFound();

    return (
        <>
            <ReservationHeader hotelName={restaurant.name} hotelLogo={restaurant.coverImage} />
            <ReservationFormClient hotelId={id} />
            <ReservationMap />
        </>
    );
}
