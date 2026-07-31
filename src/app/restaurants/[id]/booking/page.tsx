import BookingHeader from '@/components/booking/BookingHeader';
import BookingForm from '@/components/booking/form/BookingForm';
import { restaurantService } from '@/services/restaurant.service';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: 'Book a Table | Anli',
    description: 'Complete your reservation.',
};

export default async function BookingPage({ params }: Props) {
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
        <div className="min-h-screen bg-white">
            <BookingHeader 
                hotelName={restaurant.name} 
                hotelLogo={restaurant.coverImage}
            />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <BookingForm hotelId={id} />
            </main>
        </div>
    );
}
