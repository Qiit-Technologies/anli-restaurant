import RestaurantLanding from '@/components/restaurants/RestaurantLanding';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Find Restaurants | Anli',
    description: 'Explore and book the best restaurants near you with Anli.',
};

export default function HomePage() {
    return <RestaurantLanding />;
}
