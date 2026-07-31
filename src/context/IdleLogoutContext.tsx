'use client';

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';

type IdleLogoutContextValue = {
    isDynamicallyExempt: boolean;
    setExempt: (id: string, exempt: boolean) => void;
};

const IdleLogoutContext = createContext<IdleLogoutContextValue>({
    isDynamicallyExempt: false,
    setExempt: () => {},
});

export function IdleLogoutProvider({ children }: { children: ReactNode }) {
    const exemptIdsRef = useRef(new Set<string>());
    const [isDynamicallyExempt, setIsDynamicallyExempt] = useState(false);

    const setExempt = useCallback((id: string, exempt: boolean) => {
        if (exempt) {
            exemptIdsRef.current.add(id);
        } else {
            exemptIdsRef.current.delete(id);
        }
        setIsDynamicallyExempt(exemptIdsRef.current.size > 0);
    }, []);

    const value = useMemo(
        () => ({ isDynamicallyExempt, setExempt }),
        [isDynamicallyExempt, setExempt],
    );

    return (
        <IdleLogoutContext.Provider value={value}>
            {children}
        </IdleLogoutContext.Provider>
    );
}

export function useIdleLogoutExemption(active: boolean) {
    const { setExempt } = useContext(IdleLogoutContext);
    const id = useId();

    useEffect(() => {
        setExempt(id, active);
        return () => setExempt(id, false);
    }, [active, id, setExempt]);
}

export function useIdleLogoutDynamicExemption() {
    return useContext(IdleLogoutContext).isDynamicallyExempt;
}
