const PAYSTACK_SCRIPT = 'https://js.paystack.co/v2/inline.js';

type PaystackTransaction = {
    reference?: string;
    trxref?: string;
};

type PaystackResumeCallbacks = {
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onLoad?: () => void;
    onError?: (error: { message?: string }) => void;
};

type PaystackInlineClient = {
    resumeTransaction: (
        accessCode: string,
        callbacks?: PaystackResumeCallbacks,
    ) => unknown;
    setup?: (config: object) => { openIframe: () => void };
};

let paystackLoadPromise: Promise<void> | null = null;

function getPaystackClient(): PaystackInlineClient | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const PaystackPop = (
        window as typeof window & {
            PaystackPop?: new () => PaystackInlineClient;
        }
    ).PaystackPop;

    if (typeof PaystackPop === 'function') {
        return new PaystackPop();
    }

    return null;
}

function waitForPaystackClient(timeoutMs = 10000): Promise<PaystackInlineClient> {
    return new Promise((resolve, reject) => {
        const started = Date.now();

        const attempt = () => {
            const client = getPaystackClient();
            if (client) {
                resolve(client);
                return;
            }

            if (Date.now() - started >= timeoutMs) {
                reject(new Error('Paystack failed to load'));
                return;
            }

            window.setTimeout(attempt, 50);
        };

        attempt();
    });
}

function ensurePaystackScriptLoaded(): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.reject(
            new Error('Paystack is only available in the browser'),
        );
    }

    if (getPaystackClient()) {
        return Promise.resolve();
    }

    if (paystackLoadPromise) {
        return paystackLoadPromise;
    }

    paystackLoadPromise = new Promise((resolve, reject) => {
        const finish = () => {
            waitForPaystackClient()
                .then(() => resolve())
                .catch(reject);
        };

        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${PAYSTACK_SCRIPT}"]`,
        );

        if (existing) {
            finish();
            return;
        }

        const script = document.createElement('script');
        script.src = PAYSTACK_SCRIPT;
        script.async = true;
        script.onload = finish;
        script.onerror = () => {
            paystackLoadPromise = null;
            reject(new Error('Failed to load Paystack'));
        };
        document.body.appendChild(script);
    });

    return paystackLoadPromise;
}

function redirectToPaystack(authorizationUrl: string) {
    window.location.assign(authorizationUrl);
}

function openPaystackPopup(
    client: PaystackInlineClient,
    accessCode: string,
    authorizationUrl: string,
    callbacks: PaystackResumeCallbacks,
) {
    let checkoutOpened = false;
    let fallbackTimer: number | undefined;

    const clearFallback = () => {
        if (fallbackTimer !== undefined) {
            window.clearTimeout(fallbackTimer);
            fallbackTimer = undefined;
        }
    };

    const markOpened = () => {
        checkoutOpened = true;
        clearFallback();
        callbacks.onLoad?.();
    };

    if (typeof client.resumeTransaction === 'function') {
        client.resumeTransaction(accessCode, {
            onLoad: markOpened,
            onSuccess: (transaction) => {
                markOpened();
                callbacks.onSuccess?.(transaction);
            },
            onCancel: () => {
                markOpened();
                callbacks.onCancel?.();
            },
            onError: (error) => {
                clearFallback();
                console.error('Paystack resumeTransaction error:', error);
                callbacks.onError?.(error);
                redirectToPaystack(authorizationUrl);
            },
        });

        fallbackTimer = window.setTimeout(() => {
            if (!checkoutOpened) {
                redirectToPaystack(authorizationUrl);
            }
        }, 2500);
        return;
    }

    redirectToPaystack(authorizationUrl);
}

export async function openPublicBookingPaystackCheckout(options: {
    accessCode: string;
    authorizationUrl: string;
    reference: string;
    email: string;
    onSuccess: (reference: string) => void | Promise<void>;
    onClose?: () => void;
}) {
    const { accessCode, authorizationUrl, reference, email, onSuccess, onClose } =
        options;

    const handleSuccess = (transaction: PaystackTransaction) => {
        const ref = transaction.reference ?? transaction.trxref ?? reference;
        void onSuccess(ref);
    };

    try {
        await ensurePaystackScriptLoaded();
        const client = getPaystackClient();

        if (client) {
            openPaystackPopup(client, accessCode, authorizationUrl, {
                onSuccess: handleSuccess,
                onCancel: onClose,
            });
            return;
        }
    } catch (error) {
        console.error('Paystack popup launch failed:', error);
    }

    // Last resort: full-page Paystack checkout (always works with access_code URL)
    redirectToPaystack(authorizationUrl);
}
