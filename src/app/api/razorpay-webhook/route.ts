
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase-admin';
import { admin } from '@/lib/firebase-admin';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!webhookSecret) {
    console.error("CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set in environment variables.");
}

async function verifySignature(body: string, signature: string): Promise<boolean> {
    if (!webhookSecret) {
        return false;
    }
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(body);
    const digest = shasum.digest('hex');
    return digest === signature;
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
        console.warn('Webhook received without signature');
        return NextResponse.json({ status: 'error', message: 'Signature missing' }, { status: 400 });
    }

    const isValid = await verifySignature(rawBody, signature);

    if (!isValid) {
        console.warn('Invalid webhook signature received');
        return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    try {
        const event = JSON.parse(rawBody);
        const eventType = event.event;
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.userId;

        if (!userId) {
            console.error('Webhook Error: userId not found in subscription notes.', { subscriptionId: subscription.id });
            return NextResponse.json({ status: 'error', message: 'User ID not found' }, { status: 400 });
        }

        const userRef = db.collection('users').doc(userId);

        if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
            const nextBillDate = new Date(subscription.charge_at * 1000);

            await userRef.set({
                isPremium: true,
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                premiumUntil: admin.firestore.Timestamp.fromDate(nextBillDate),
            }, { merge: true });

            console.log(`Successfully activated or charged subscription for user: ${userId}`);

        } else if (eventType === 'subscription.cancelled' || eventType === 'subscription.halted') {
             await userRef.update({
                isPremium: false,
                subscriptionStatus: subscription.status,
            });
            console.log(`Subscription cancelled or halted for user: ${userId}`);
        }

        return NextResponse.json({ status: 'success' }, { status: 200 });

    } catch (error) {
        console.error('Error processing Razorpay webhook:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ status: 'error', message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}
