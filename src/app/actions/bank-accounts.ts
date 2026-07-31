import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { ScopedAccount } from '@/components/front-of-house/types';

export interface BankAccount {
    id?: number;
    accountName: string;
    accountNumber: string;
    accountType: string;
    department: number;
    module: string;
    bankName: string;
    balance?: number;
    description?: string;
    isPayroll?: boolean;
}

export async function createBankAccount(bankAccountData: BankAccount) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post('/bank-accounts', bankAccountData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 201) {
            return {
                error:
                    response.data?.message || 'Failed to create bank account.',
            };
        }

        return {
            message: 'Bank account created successfully.',
            bankAccount: response.data,
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getAllBankAccounts() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/bank-accounts', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch bank accounts.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPublicBankAccounts(hotelId: string) {
    try {
        const response = await api.get(`/bank-accounts/public/${hotelId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch bank accounts.',
            };
        }

        return response.data;
    } catch (error) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getAccountStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/bank-accounts/account-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message ||
                    'Failed to fetch account statistics.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getBalanceSummary() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/bank-accounts/balance-summary', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message ||
                    'Failed to fetch balance summary.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getBankAccount(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/bank-accounts/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch bank account.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Update bank account
export async function updateBankAccount(id: number, updateData: ScopedAccount) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(`/bank-accounts/${id}`, updateData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to update bank account.',
            };
        }

        return { message: 'Bank account updated successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Delete/Deactivate bank account
export async function deleteBankAccount(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.delete(`/bank-accounts/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to delete bank account.',
            };
        }

        return { message: 'Bank account deleted successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function activateBankAccount(
    id: number,
    status: boolean | undefined,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/bank-accounts/activate/${id}`,
            { status },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to update bank account.',
            };
        }

        return {
            message: `Bank account ${status === true ? 'activated' : 'deactivated'} successfully!`,
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getIncomeSummary() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/bank-accounts/income-summary', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch income summary.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getAccountsByDepartment(departmentId: number | string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(
            `/bank-accounts/by-department/${departmentId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status !== 200) {
            return {
                error:
                    response.data?.message ||
                    'Failed to fetch accounts by department.',
            };
        }
        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
