'use server';

import { createClient } from '@/utils/supabase/server';

export async function getReferralStats() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Fetch referrals for this referrer
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referrals:', error);
    return { referrals: [], totalCredits: 0 };
  }

  const totalCredits = (referrals || []).reduce((sum, ref) => sum + (ref.reward_credits || 0), 0);

  return {
    referrals: referrals || [],
    totalCredits,
    userId: user.id
  };
}
