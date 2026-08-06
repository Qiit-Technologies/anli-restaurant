import mixpanel from 'mixpanel-browser';
import { customerAuthService } from '@/services/customerAuth.service';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';
console.log('Mixpanel Token:', MIXPANEL_TOKEN);
if (MIXPANEL_TOKEN && typeof window !== 'undefined') {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
    cross_site_cookie: false,
    secure_cookie: true,
    ip: false,
    property_blacklist: ['$current_url', '$initial_referrer', '$referrer'],
  });
}

const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const user = customerAuthService.getUser();
    return user?.id ? String(user.id) : null;
  } catch {
    return null;
  }
};

export const analytics = {
  track: (eventName: string, properties?: Record<string, unknown>) => {
    if (!MIXPANEL_TOKEN) return;
    const userId = getCurrentUserId();
    mixpanel.track(eventName, {
      ...properties,
      ...(userId && { user_id: userId }),
    });
  },

  identify: (userId: string) => {
    if (!MIXPANEL_TOKEN) return;
    mixpanel.identify(userId);
  },

  people: {
    set: (properties: Record<string, unknown>) => {
      if (!MIXPANEL_TOKEN) return;
      mixpanel.people.set(properties);
    },
    setOnce: (properties: Record<string, unknown>) => {
      if (!MIXPANEL_TOKEN) return;
      mixpanel.people.set_once(properties);
    },
    increment: (property: string, value: number = 1) => {
      if (!MIXPANEL_TOKEN) return;
      mixpanel.people.increment(property, value);
    },
  },

  alias: (alias: string) => {
    if (!MIXPANEL_TOKEN) return;
    mixpanel.alias(alias);
  },

  reset: () => {
    if (!MIXPANEL_TOKEN) return;
    mixpanel.reset();
  },

  trackPageView: (pageName: string, properties?: Record<string, unknown>) => {
    if (!MIXPANEL_TOKEN) return;
    mixpanel.track('Page View', {
      page: pageName,
      ...properties,
    });
  },

  registerSuperProperties: (properties: Record<string, unknown>) => {
    if (!MIXPANEL_TOKEN) return;
    mixpanel.register(properties);
  },

  unregisterSuperProperty: (property: string) => {
    if (!MIXPANEL_TOKEN) return;
    mixpanel.unregister(property);
  },
};

export const EVENTS = {
  PAGE_VIEW: 'Page View',
  SEARCH_PERFORMED: 'Search Performed',
  SEARCH_SUBMITTED: 'Search Submitted',
  SEARCH_CLOSED: 'Search Closed',
  RECENT_SEARCH_CLICKED: 'Recent Search Clicked',
  FILTER_APPLIED: 'Filter Applied',
  SORT_APPLIED: 'Sort Applied',
  RESTAURANT_CLICKED: 'Restaurant Clicked',
  RESTAURANT_DETAIL_VIEWED: 'Restaurant Detail Viewed',
  BOOKING_STARTED: 'Booking Started',
  BOOKING_CREATED: 'Booking Created',
  BOOKING_FAILED: 'Booking Failed',
  FAVORITE_TOGGLED: 'Favorite Toggled',
  FAVORITE_CLICK: 'Favorite Click',
  LOGIN_SUCCESS: 'Login Success',
  LOGIN_FAILED: 'Login Failed',
  SIGNUP_INITIATED: 'Signup Initiated',
  SIGNUP_SUCCESS: 'Signup Success',
  SIGNUP_OTP_FAILED: 'Signup OTP Failed',
  LOGOUT: 'Logout',
  LOCATION_CHANGED: 'Location Changed',
  BOOKINGS_PAGE_VIEWED: 'Bookings Page Viewed',
} as const;

export default analytics;
