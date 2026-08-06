import RestaurantDetail from '@/components/restaurants/RestaurantDetail';
import { Metadata } from 'next';
import { restaurantService } from '@/services/restaurant.service';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: 'Restaurant Details | Anli',
        description: 'View restaurant details and book a table.',
    };
}

export default async function RestaurantPage({ params }: Props) {
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

    return <RestaurantDetail id={String(restaurant.id)} slug={slug} />;
}
