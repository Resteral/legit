'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?error=Could not create user')
  }

  // Record referral if referrer ID is passed
  const referrerId = formData.get('ref') as string
  if (referrerId && authData?.user) {
    const { error: refError } = await supabase
      .from('referrals')
      .insert([
        {
          referrer_id: referrerId,
          referred_user_id: authData.user.id,
          referred_email: authData.user.email,
          status: 'converted'
        }
      ])
    if (refError) {
      console.error('Error recording referral:', refError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
