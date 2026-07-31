'use client';

import { TUser } from '@/types/user';
import {
    createContext,
    ReactNode,
    Suspense,
    useContext,
    useState,
} from 'react';
import NextTopLoader from 'nextjs-toploader';
import { Loader2 } from 'lucide-react';

interface UserContextType {
    user: TUser | undefined;
    setUser: (user: TUser | undefined) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<TUser>();
    const [loading, setLoading] = useState(true);

    return (
        <UserContext.Provider value={{ user, setUser, loading, setLoading }}>
            <NextTopLoader
                color="#FF6F00"
                initialPosition={0.08}
                crawlSpeed={200}
                height={5}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                zIndex={1000000}
                shadow="0 0 10px #FF6F00,0 0 5px #FF6F00"
            />
            <Suspense
                fallback={
                    <div className="min-h-[100vh] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-hexbrand" />
                    </div>
                }
            >
                {children}
            </Suspense>
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
