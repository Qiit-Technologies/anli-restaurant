'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// import { NextResponse } from 'next/server'

export async function signout() {
    const _cookies = await cookies();
    await _cookies.delete('token');
    await _cookies.delete('user');
    redirect('/auth/sign-in');
}
