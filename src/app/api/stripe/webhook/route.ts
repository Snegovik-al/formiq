import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan
      if (!userId) break

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubId: session.subscription as string,
          stripeCustId: session.customer as string,
          planId: plan ?? 'monthly',
          status: 'active',
          trialEnd: null,
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
        },
        update: {
          stripeSubId: session.subscription as string,
          stripeCustId: session.customer as string,
          planId: plan ?? 'monthly',
          status: 'active',
          trialEnd: null,
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
        },
      })
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (sub as any).current_period_end
      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subId = (invoice as any).subscription as string | null
      if (subId) {
        await prisma.subscription.updateMany({
          where: { stripeSubId: subId },
          data: { status: 'past_due' },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
