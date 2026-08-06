import RestaurantMenu from '@/components/restaurants/RestaurantMenu';
import { Metadata } from 'next';
import { restaurantService } from '@/services/restaurant.service';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: 'Restaurant Menu | Anli',
        description: 'Explore the full menu.',
    };
}

export default async function MenuPage({ params }: Props) {
    const { slug } = await params;

    let restaurant;
    try {
        const decodedSlug = decodeURIComponent(slug);
        restaurant = await restaurantService.resolveBySlug(decodedSlug);
    } catch (error) {
        console.error('Error resolving restaurant slug:', error);
        return notFound();
    }

    if (!restaurant) {
        return notFound();
    }

    return <RestaurantMenu id={String(restaurant.id)} />;
}
