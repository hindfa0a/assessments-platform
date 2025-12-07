import { createHmac } from 'crypto';

/**
 * Moyasar API Configuration
 */
const MOYASAR_API_URL = 'https://api.moyasar.com/v1';
const MOYASAR_API_KEY = process.env.MOYASAR_API_KEY!;
const MOYASAR_WEBHOOK_SECRET = process.env.MOYASAR_WEBHOOK_SECRET!;

if (!MOYASAR_API_KEY) {
    console.warn('MOYASAR_API_KEY is not set');
}

/**
 * Types
 */

export interface MoyasarInvoice {
    id: string;
    status: 'initiated' | 'paid' | 'failed' | 'canceled';
    amount: number;
    currency: string;
    description: string;
    callback_url: string;
    url: string; // Payment page URL
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface MoyasarPayment {
    id: string;
    status: 'initiated' | 'paid' | 'failed' | 'authorized' | 'captured' | 'refunded' | 'voided';
    amount: number;
    fee: number;
    currency: string;
    refunded: number;
    refunded_at: string | null;
    captured: number;
    captured_at: string | null;
    voided_at: string | null;
    description: string;
    amount_format: string;
    fee_format: string;
    refunded_format: string;
    captured_format: string;
    invoice_id: string | null;
    ip: string | null;
    callback_url: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
    source: {
        type: 'creditcard' | 'applepay' | 'stcpay';
        company?: string;
        name?: string;
        number?: string;
        gateway_id?: string;
        reference_number?: string;
        token?: string;
        message?: string;
        transaction_url?: string;
    };
}

/**
 * API Wrapper Functions
 */

export async function createInvoice(data: {
    amount: number; // In Halalas (e.g., 1000 for 10 SAR)
    currency: string; // 'SAR'
    description: string;
    callback_url: string;
    metadata?: Record<string, any>;
}): Promise<MoyasarInvoice> {
    const response = await fetch(`${MOYASAR_API_URL}/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(MOYASAR_API_KEY + ':').toString('base64')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Moyasar API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}

export async function fetchPayment(id: string): Promise<MoyasarPayment> {
    const response = await fetch(`${MOYASAR_API_URL}/payments/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${Buffer.from(MOYASAR_API_KEY + ':').toString('base64')}`
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Moyasar API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}

export async function fetchInvoice(id: string): Promise<MoyasarInvoice> {
    const response = await fetch(`${MOYASAR_API_URL}/invoices/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${Buffer.from(MOYASAR_API_KEY + ':').toString('base64')}`
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Moyasar API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}
