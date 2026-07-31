# ANLI Restaurant - Agent Guide

## Mixpanel Analytics

This project uses **Mixpanel** for product analytics. All event tracking must go through the Mixpanel utility layer.

### Setup
- **Project token:** stored in `.env` as `NEXT_PUBLIC_MIXPANEL_TOKEN`
- **SDK:** `mixpanel-browser` (client-side)
- **Initialization:** `src/components/common/MixpanelInit.tsx` — auto-initializes on client mount

### Event Tracking Pattern

```typescript
import { trackEvent } from '@/lib/mixpanel';

trackEvent('event_name', {
  property_one: 'value',
  property_two: 123,
});
```

### Identity Management

| Flow | Call |
|------|------|
| Login / Signup success | `identifyUser(user.id, { email, first_name, last_name })` |
| Logout | `resetMixpanel()` |
| App open with existing session | `identifyUser()` in `CustomerHeader` useEffect |

### Currently Tracked Events

- `page_view` — landing page load
- `search_submitted` — search form submitted
- `search_performed` — search results returned
- `search_closed` — search page closed
- `recent_search_clicked` — recent search term clicked
- `filter_applied` — price/cuisine/sort filter changed
- `restaurant_clicked` — restaurant card clicked
- `restaurant_detail_viewed` — restaurant detail page loaded
- `booking_started` — booking flow initiated
- `booking_created` — booking successfully created
- `booking_failed` — booking creation failed
- `favorite_toggled` — favorite added/removed
- `favorite_click` — favorite clicked while logged out
- `login_success` / `login_failed` — login attempts
- `signup_initiated` / `signup_success` / `signup_otp_failed` — signup flow
- `logout` — user logged out
- `location_changed` — location changed in header
- `bookings_page_viewed` — bookings page loaded

### Adding New Events

1. Import `trackEvent` from `@/lib/mixpanel`
2. Place the call as close to the triggering action as possible
3. Use snake_case for event names and property names
4. Include 2-3 relevant properties minimum
5. Do not include PII unless explicitly approved

### Compliance

- If adding consent/opt-in tracking, gate `initMixpanel()` behind consent status
- Do not send events before consent is obtained for EU/CA users
- Track minimum required user attributes only
