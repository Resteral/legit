'use client';

import { useState } from 'react';
import { Gift, Copy, Check, Users, Sparkles, Share2, Mail } from 'lucide-react';

interface Referral {
  id: string;
  referred_email: string;
  reward_credits: number;
  status: string;
  created_at: string;
}

interface ReferralClientProps {
  initialReferrals: Referral[];
  initialCredits: number;
  userId: string;
}

export default function ReferralClient({ initialReferrals, initialCredits, userId }: ReferralClientProps) {
  const [referrals] = useState<Referral[]>(initialReferrals);
  const [credits] = useState<number>(initialCredits);
  const [copied, setCopied] = useState(false);

  // Generate unique referral link
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/signup?ref=${userId}` 
    : `https://resolve.bet/signup?ref=${userId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-secondary/10 border border-border/50 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Referred Signups</span>
            <span className="text-2xl font-extrabold text-white">{referrals.length}</span>
          </div>
        </div>

        <div className="bg-secondary/10 border border-border/50 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Credits Earned</span>
            <span className="text-2xl font-extrabold text-green-400">+{credits} AI Credits</span>
          </div>
        </div>

        <div className="bg-secondary/10 border border-border/50 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Earn Rate</span>
            <span className="text-sm font-extrabold text-white">5 Credits / Join</span>
          </div>
        </div>
      </div>

      {/* Share card */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-indigo-500/10 border border-border/50 rounded-3xl p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="max-w-2xl space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Share2 className="w-5 h-5 text-primary" />
            Your Unique Referral Link
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Copy and send this link to other founders or business owners. When they create an account on Resolve.bet, we will instantly add 5 free website generation credits to your dashboard!
          </p>

          <div className="bg-black/30 border border-border/40 p-2.5 rounded-2xl flex gap-2 max-w-xl">
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              className="flex-grow bg-transparent border-0 px-3 text-xs text-gray-300 font-mono focus:outline-none"
            />
            <button 
              onClick={handleCopyLink}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-5 gap-8 items-start">
        {/* Table Column */}
        <div className="md:col-span-3 space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-muted-foreground tracking-wider">Your Referral History</h3>
          
          {referrals.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-border/50 rounded-2xl bg-secondary/5 text-muted-foreground">
              You haven&apos;t referred anyone yet. Copy your link above and start sharing!
            </div>
          ) : (
            <div className="border border-border/50 rounded-2xl overflow-hidden bg-black/10 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 border-b border-border/40 text-gray-400">
                    <th className="p-4 font-bold">Email Address</th>
                    <th className="p-4 font-bold text-center">Reward</th>
                    <th className="p-4 font-bold text-center">Status</th>
                    <th className="p-4 font-bold">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {referrals.map((ref) => (
                    <tr key={ref.id}>
                      <td className="p-4 text-white font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        {ref.referred_email}
                      </td>
                      <td className="p-4 text-center text-green-400 font-bold">+{ref.reward_credits} Credits</td>
                      <td className="p-4 text-center">
                        <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {ref.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="md:col-span-2 space-y-6 bg-secondary/10 border border-border/50 rounded-3xl p-6">
          <h3 className="text-xs uppercase font-extrabold text-white tracking-wider flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-primary animate-bounce" />
            Viral PLG Loop Ideas
          </h3>

          <div className="space-y-4 text-xs leading-relaxed text-gray-400">
            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                1. Embed the Referral Badge
              </h4>
              <p>
                Every website you build contains a subtle &ldquo;Powered by Resolve.bet&rdquo; badge at the bottom. Anyone who clicks it and signs up is credited directly to your account.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                2. Share Template Previews
              </h4>
              <p>
                Send previews of generated websites to friends or clients. When they click the browser preview toolbar, it maps your referral token.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                3. Post in Freelancer Subreddits
              </h4>
              <p>
                Help other freelancers skip Squarespace fees by sharing your link. Explain how they can quickly spin up client landing pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
