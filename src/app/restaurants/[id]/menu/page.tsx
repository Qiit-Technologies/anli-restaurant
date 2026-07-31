import RestaurantMenu from '@/components/restaurants/RestaurantMenu';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    return {
        title: 'Restaurant Menu | Anli',
        description: 'Explore the full menu.',
    };
}

export default async function MenuPage({ params }: Props) {
    const { id } = await params;
    
    return <RestaurantMenu id={id} />;
}
