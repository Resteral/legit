import { getReferralStats } from './actions';
import ReferralClient from './ReferralClient';
import { redirect } from 'next/navigation';

export default async function ReferralsPage() {
  const stats = await getReferralStats();

  if ('error' in stats) {
    redirect('/login');
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Referrals & Rewards</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share your referral link with other business owners. Earn 5 free AI site builder credits for every sign-up!
        </p>
      </header>

      <ReferralClient 
        initialReferrals={stats.referrals} 
        initialCredits={stats.totalCredits} 
        userId={stats.userId || ''} 
      />
    </div>
  );
}
