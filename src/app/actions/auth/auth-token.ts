'use server';

import { cookies } from 'next/headers';

export async function getAuthToken() {
    const _cookies = await cookies();
    const token = _cookies.get('access_token');
    return token ? token.value : null;
}
