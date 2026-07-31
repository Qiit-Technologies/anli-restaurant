import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';
const MIXPANEL_TRACK_ENDPOINT = 'https://api.mixpanel.com/track';

function isMixpanelAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return !!window.mixpanel && typeof window.mixpanel.track === 'function';
    } catch {
        return false;
    }
}

export function initMixpanel() {
    if (typeof window === 'undefined' || !MIXPANEL_TOKEN) {
        return;
    }
    try {
        mixpanel.init(MIXPANEL_TOKEN, {
            debug: process.env.NODE_ENV === 'development',
            track_pageview: true,
            persistence: 'localStorage',
        });
    } catch (error) {
        console.error('Mixpanel init error:', error);
    }
}

async function httpTrack(
    eventName: string,
    properties?: Record<string, unknown>,
): Promise<void> {
    if (typeof window === 'undefined' || !MIXPANEL_TOKEN) return;

    try {
        const payload = {
            event: eventName,
            properties: {
                token: MIXPANEL_TOKEN,
                distinct_id: properties?.distinct_id || 'anonymous',
                time: Date.now(),
                ...properties,
            },
        };

        const params = new URLSearchParams();
        params.append('data', JSON.stringify(payload));

        await fetch(MIXPANEL_TRACK_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
    } catch (error) {
        console.error('Mixpanel HTTP track error:', error);
    }
}

export async function trackEvent(eventName: string, properties?: Record<string, unknown>) {
    if (typeof window === 'undefined') {
        return;
    }

    if (isMixpanelAvailable()) {
        try {
            mixpanel.track(eventName, properties);
            return;
        } catch (error) {
            console.error('Mixpanel SDK track error, falling back to HTTP:', error);
        }
    }

    await httpTrack(eventName, properties);
}

export async function identifyUser(userId: string, userProperties?: Record<string, unknown>) {
    if (typeof window === 'undefined') {
        return;
    }

    if (isMixpanelAvailable()) {
        try {
            mixpanel.identify(userId);
            if (userProperties) {
                mixpanel.people.set(userProperties);
            }
        } catch (error) {
            console.error('Mixpanel SDK identify error, falling back:', error);
        }
    }
}

export function resetMixpanel() {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        if (isMixpanelAvailable()) {
            mixpanel.reset();
        }
    } catch (error) {
        console.error('Mixpanel reset error:', error);
    }
}

export function setUserProperties(properties: Record<string, unknown>) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        if (isMixpanelAvailable()) {
            mixpanel.people.set(properties);
        }
    } catch (error) {
        console.error('Mixpanel setUserProperties error:', error);
    }
}

declare global {
    interface Window {
        mixpanel: any;
    }
}
