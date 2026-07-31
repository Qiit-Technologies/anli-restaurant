import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';

export function initMixpanel() {
    if (typeof window === 'undefined' || !MIXPANEL_TOKEN) {
        return;
    }
    mixpanel.init(MIXPANEL_TOKEN, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
    });
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        mixpanel.track(eventName, properties);
    } catch (error) {
        console.error('Mixpanel track error:', error);
    }
}

export function identifyUser(userId: string, userProperties?: Record<string, unknown>) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        mixpanel.identify(userId);
        if (userProperties) {
            mixpanel.people.set(userProperties);
        }
    } catch (error) {
        console.error('Mixpanel identify error:', error);
    }
}

export function resetMixpanel() {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        mixpanel.reset();
    } catch (error) {
        console.error('Mixpanel reset error:', error);
    }
}

export function setUserProperties(properties: Record<string, unknown>) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        mixpanel.people.set(properties);
    } catch (error) {
        console.error('Mixpanel setUserProperties error:', error);
    }
}

declare global {
    interface Window {
        mixpanel: any;
    }
}
