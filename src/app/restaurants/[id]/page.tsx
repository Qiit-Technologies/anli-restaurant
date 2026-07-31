import RestaurantDetail from '@/components/restaurants/RestaurantDetail';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    // We'd ideally fetch the name here, but for now we'll use a generic title
    return {
        title: 'Restaurant Details | Anli',
        description: 'View restaurant details and book a table.',
    };
}

export default async function RestaurantPage({ params }: Props) {
    const { id } = await params;
    
    return <RestaurantDetail id={id} />;
}
