import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');

    // Process Stripe event types: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
    return NextResponse.json({
      received: true,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }
}
