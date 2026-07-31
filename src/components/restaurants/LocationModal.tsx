'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Navigation, Loader2 } from 'lucide-react';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: string, lat?: number, lon?: number) => void;
    currentLocation: string;
}

const POPULAR_LOCATIONS = [
    { name: 'Lekki Phase 1', address: 'Lekki Phase 1, Lagos', lat: 6.4474, lng: 3.4722 },
    { name: 'Victoria Island', address: 'Victoria Island, Lagos', lat: 6.4281, lng: 3.4219 },
    { name: 'Ikoyi', address: 'Ikoyi, Lagos', lat: 6.4549, lng: 3.4326 },
    { name: 'Ikeja', address: 'Ikeja, Lagos', lat: 6.6018, lng: 3.3515 },
    { name: 'Surulere', address: 'Surulere, Lagos', lat: 6.5059, lng: 3.3581 },
];

export default function LocationModal({ isOpen, onClose, onSelect, currentLocation }: LocationModalProps) {
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (search.length < 3) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&countrycodes=ng&addressdetails=1&limit=5`);
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error('Error fetching locations:', err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-[#3D2117]">Change Location</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search for your area..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-12 text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="text-orange-500 animate-spin" size={20} />
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((pos) => {
                                    onSelect('Current Location', pos.coords.latitude, pos.coords.longitude);
                                    onClose();
                                });
                            }
                        }}
                        className="w-full flex items-center gap-3 p-4 bg-orange-50 text-orange-600 rounded-xl font-bold mb-6 hover:bg-orange-100 transition-all"
                    >
                        <Navigation size={20} />
                        <span>Use Current Location</span>
                    </button>

                    {suggestions.length > 0 ? (
                        <div className="space-y-2 mb-6">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Search Results</h4>
                            {suggestions.map((loc) => (
                                <button 
                                    key={loc.place_id}
                                    onClick={() => {
                                        onSelect(loc.address.suburb || loc.address.neighbourhood || loc.display_name.split(',')[0], parseFloat(loc.lat), parseFloat(loc.lon));
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group text-left"
                                >
                                    <MapPin size={18} className="text-gray-300 group-hover:text-orange-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-[#3D2117] font-bold text-sm leading-tight">{loc.display_name.split(',')[0]}</p>
                                        <p className="text-gray-400 text-xs truncate">{loc.display_name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : search.length < 3 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Popular Areas</h4>
                            <div className="space-y-2">
                                {POPULAR_LOCATIONS.map((loc) => (
                                    <button 
                                        key={loc.name}
                                        onClick={() => {
                                            onSelect(loc.name, loc.lat, loc.lng);
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                                    >
                                        <MapPin size={18} className="text-gray-300 group-hover:text-orange-500" />
                                        <span className={`text-gray-600 group-hover:text-[#3D2117] text-sm ${currentLocation === loc.name ? 'font-bold text-[#3D2117]' : ''}`}>
                                            {loc.address}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
