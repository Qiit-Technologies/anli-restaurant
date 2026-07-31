import api from './axios';

export const fetcher = async <T>(url: string) => {
    const response = await api.get<T>(url);
    return response.data;
};

const createApiEndpoints = (resource: string) => ({
    getAll: () => fetcher(`/${resource}`),
    getById: (id: string) => fetcher(`/${resource}/${id}`),
    create: (data: unknown) => api.post(`/${resource}`, data),
    update: (id: string, data: unknown) =>
        api.patch(`/${resource}/${id}`, data),
    delete: (id: string) => api.delete(`/${resource}/${id}`),
});

export const itemsApi = createApiEndpoints('items');
export const roomsApi = createApiEndpoints('rooms');

/**
 * Safe alternative to `response.json()`.
 *
 * Reads the body as text first so that an empty / 204 body never triggers
 * "Unexpected end of JSON input". Throws a descriptive error instead of a
 * cryptic parse failure so it surfaces clearly in logs and error boundaries.
 *
 * Usage:
 *   const data = await safeResponseJson<MyType>(response);
 */
export async function safeResponseJson<T = any>(
    response: Response,
): Promise<T> {
    const text = await response.text();
    if (!text || !text.trim()) {
        throw new Error(
            `Empty response body (status ${response.status} ${response.statusText}) — expected JSON`,
        );
    }
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error(
            `Invalid JSON in response (status ${response.status}): ${text.slice(0, 200)}`,
        );
    }
}

/**
 * Like safeResponseJson but returns `null` instead of throwing when the
 * body is empty. Useful for DELETE / 204 endpoints where no body is expected.
 */
export async function safeResponseJsonOrNull<T = any>(
    response: Response,
): Promise<T | null> {
    const text = await response.text();
    if (!text || !text.trim()) return null;
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error(
            `Invalid JSON in response (status ${response.status}): ${text.slice(0, 200)}`,
        );
    }
}

/**
 * For error branches: reads the response body and always returns an object
 * with an optional `message` string — never throws, never returns null.
 *
 * Replaces the pattern:
 *   const error = await safeResponseJsonOrNull(response) ?? {};
 *   error.message  // TS error: Property 'message' does not exist on type '{}'
 *
 * With the safe, typed equivalent:
 *   const error = await safeErrorJson(response);
 *   error.message  // ✅ string | undefined
 */
export async function safeErrorJson(
    response: Response,
): Promise<{ message?: string; [key: string]: unknown }> {
    const text = await response.text();
    if (!text || !text.trim()) return {};
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as { message?: string; [key: string]: unknown };
        }
        return {};
    } catch {
        return {};
    }
}
