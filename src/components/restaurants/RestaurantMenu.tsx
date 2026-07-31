'use client';

import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Search,
    ChevronLeft,
    X,
    Info,
    Utensils
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { restaurantService, Restaurant, Menu } from '@/services/restaurant.service';
import CustomerHeader from './CustomerHeader';

interface RestaurantMenuProps {
    id: string;
    hotelName?: string;
}

export default function RestaurantMenu({ id, hotelName }: RestaurantMenuProps) {
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategory(entry.target.id);
                        
                        // Slide nav bar to center active item
                        const navItem = document.getElementById(`nav-category-${entry.target.id.replace('category-', '')}`);
                        const container = document.getElementById('category-scroll-container');
                        if (navItem && container) {
                            const scrollLeft = navItem.offsetLeft - (container.offsetWidth / 2) + (navItem.offsetWidth / 2);
                            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                        }
                    }
                });
            },
            { threshold: 0.2, rootMargin: '-160px 0px -40% 0px' }
        );

        const sections = document.querySelectorAll('section[id^="category-"]');
        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, [menu, loading]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const restaurantId = Number(id);
                const [restaurantData, menuData] = await Promise.all([
                    restaurantService.getDetails(restaurantId),
                    restaurantService.getMenu(restaurantId),
                ]);
                setRestaurant(restaurantData);
                setMenu(menuData);
            } catch (error) {
                console.error('Error fetching menu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F8]">
                <CustomerHeader showBackButton />
                <div className="pt-24 max-w-7xl mx-auto px-4 md:px-12 animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-lg w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded-[32px] w-full mb-12"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-gray-200 rounded-[24px]"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!restaurant) return null;

    const allItems = menu.flatMap(m => m.categories.flatMap(c => c.items || []));
    const filteredItems = searchQuery 
        ? allItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : null;

    return (
        <div className="min-h-screen bg-[#F6F6F8]">
            <CustomerHeader showBackButton />

            {/* Hero Section */}
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                <Image 
                    src={restaurant.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <button 
                        onClick={() => router.back()}
                        className="absolute top-8 left-8 md:left-12 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-bold text-sm">Back</span>
                    </button>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-xl">
                        {restaurant.name}
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl drop-shadow-md">
                        Authentic culinary journey through our curated selection
                    </p>
                </div>
            </div>

            {/* Menu Navigation & Search */}
            <div className="sticky top-[64px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1" id="category-scroll-container">
                        <button 
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-[#FF8A00] text-white shadow-lg shadow-orange-500/30' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            onClick={() => {
                                setActiveCategory('all');
                                window.scrollTo({ top: 400, behavior: 'smooth' });
                            }}
                        >
                            All Menu
                        </button>
                        {menu.map((m) => (
                            <button 
                                key={m.id}
                                id={`nav-category-${m.id}`}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === `category-${m.id}` ? 'bg-[#FF8A00] text-white shadow-lg shadow-orange-500/30' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                onClick={() => {
                                    setActiveCategory(`category-${m.id}`);
                                    const element = document.getElementById(`category-${m.id}`);
                                    if (element) {
                                        const offset = 160;
                                        const bodyRect = document.body.getBoundingClientRect().top;
                                        const elementRect = element.getBoundingClientRect().top;
                                        const elementPosition = elementRect - bodyRect;
                                        const offsetPosition = elementPosition - offset;
                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                        });
                                    }
                                    
                                    // Slide the nav bar to center this item
                                    const navItem = document.getElementById(`nav-category-${m.id}`);
                                    const container = document.getElementById('category-scroll-container');
                                    if (navItem && container) {
                                        const scrollLeft = navItem.offsetLeft - (container.offsetWidth / 2) + (navItem.offsetWidth / 2);
                                        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                                    }
                                }}
                            >
                                {m.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-12 py-12">
                {searchQuery && filteredItems?.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1A202C] mb-2">No results found</h3>
                        <p className="text-gray-500">
                            We couldn&apos;t find any dishes matching &ldquo;
                            {searchQuery}&rdquo;
                        </p>
                    </div>
                ) : (
                    menu.map((m) => {
                        const items = m.categories.flatMap(c => c.items || []).filter(item => 
                            !searchQuery || 
                            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        if (items.length === 0) return null;

                        return (
                            <section key={m.id} id={`category-${m.id}`} className="mb-20 scroll-mt-40">
                                <div className="flex items-center gap-6 mb-10">
                                    <h2 className="text-3xl font-black text-[#1A202C] whitespace-nowrap">
                                        {m.name}
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {items.map((item, idx) => (
                                        <div 
                                            key={idx}
                                            className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col"
                                        >
                                            <div className="relative h-56 w-full overflow-hidden">
                                                <Image 
                                                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"} 
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                                                    <span className="text-orange-600 font-black text-sm">₦{item.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="font-bold text-[#1A202C] text-xl mb-2 group-hover:text-orange-500 transition-colors">
                                                    {item.name}
                                                </h3>
                                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                                    {item.description || "A masterfully crafted dish featuring fresh, seasonal ingredients and signature house spices."}
                                                </p>
                                                <button 
                                                    onClick={() => setSelectedItem(item)}
                                                    className="mt-auto w-full py-3 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                                                >
                                                    View Item
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })
                )}
            </main>

            {/* Item Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-lg transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative w-full md:w-1/2 h-72 md:h-auto overflow-hidden">
                            <Image 
                                src={selectedItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"}
                                alt={selectedItem.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="p-8 md:p-12 flex-1 flex flex-col">
                            <div className="mb-8">
                                <div className="flex items-center gap-2 text-orange-500 font-bold text-sm mb-2">
                                    <Utensils size={16} />
                                    <span>Special Dish</span>
                                </div>
                                <h2 className="text-3xl font-black text-[#1A202C] mb-4 leading-tight">
                                    {selectedItem.name}
                                </h2>
                                <div className="text-2xl font-black text-orange-500">
                                    ₦{selectedItem.price.toLocaleString()}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h4>
                                <p className="text-gray-500 leading-relaxed mb-8">
                                    {selectedItem.description || "Indulge in this exquisite culinary creation, prepared with the finest seasonal ingredients and a perfect balance of traditional spices and modern techniques. Each bite offers a harmonious explosion of flavors that will leave you wanting more."}
                                </p>

                                <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
                                    <Info size={18} className="text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">Service Note</p>
                                        <p className="text-[10px] text-gray-500 leading-tight">Prices are inclusive of VAT and service charge. Availability might vary based on daily fresh supplies.</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="mt-8 w-full py-4 bg-[#FF8A00] text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-[0.98]"
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
