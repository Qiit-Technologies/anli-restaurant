import RestaurantDetail from '@/components/restaurants/RestaurantDetail';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    return {
        title: 'Restaurant Details | Anli',
        description: 'View restaurant details and book a table.',
    };
}

export default async function ScrapedRestaurantPage({ params }: Props) {
    const { id } = await params;
    
    return <RestaurantDetail id={id} />;
}
