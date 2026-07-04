'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function saveGeneratedSite(
  businessName: string,
  industry: string,
  prompt: string,
  targetAudience: string,
  features: string[],
  colorScheme: string,
  location: string
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to generate a site.' }
  }

  // 1. Construct prompt for Claude Sonnet
  const systemPrompt = `You are an expert web developer and UI designer. 
Your task is to generate a beautiful, modern, responsive landing page using HTML and Tailwind CSS via CDN.
Include a Header, Hero Section, Features Section, and Footer.
Do not include \`\`\`html tags in the output, just raw valid HTML starting with <!DOCTYPE html>.
Ensure the Tailwind CSS script is included in the <head>: <script src="https://cdn.tailwindcss.com"></script>.
Include inline CSS animations.
The page MUST match the user's styling vibe (Colors: ${colorScheme}).`;

  const userPrompt = `Generate the full HTML page for:
Business Name: ${businessName}
Industry: ${industry}
Target Audience: ${targetAudience}
Location/City: ${location}
Core Description: ${prompt}
Vibe/Color Theme: ${colorScheme}
Requested Interactive Features to design into the page:
${features.map(f => `- ${f}`).join('\n')}

Specific design guidelines:
- If E-Commerce is requested, design a fully styled product grid with prices, stock tags, and "Add to Cart" buttons.
- If Contact Form is requested, build a beautiful card form with input fields for Name, Email, and message.
- If Booking Calendar is requested, render a modern calendar scheduler UI block with time slots.
- Make the header logo say "${businessName}".`;

  let generatedHtml = '';
  try {
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-latest'),
      system: systemPrompt,
      prompt: userPrompt,
    });
    
    generatedHtml = response.text.trim();
    if (generatedHtml.startsWith('```html')) {
      generatedHtml = generatedHtml.replace(/```html/g, '').replace(/```/g, '').trim();
    }
  } catch (err) {
    console.error('Anthropic Error:', err);
    return { error: 'Failed to connect to AI generator. Make sure ANTHROPIC_API_KEY is set in .env.local.' }
  }

  // 2. Insert into the database
  const siteUrl = `${businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.resolve.bet`;
  
  const { data: siteData, error: siteError } = await supabase
    .from('sites')
    .insert([
      {
        user_id: user.id,
        name: businessName,
        industry: industry,
        prompt: `Name: ${businessName}. Description: ${prompt}. Audience: ${targetAudience}. Features: ${features.join(', ')}. Theme: ${colorScheme}.`,
        url: siteUrl,
        status: 'Published',
        html_content: generatedHtml,
        location: location || 'Seattle, WA'
      }
    ])
    .select()
    .single();

  if (siteError) {
    console.error('Error saving site:', siteError)
    return { error: 'Failed to save generated site to database.' }
  }

  revalidatePath('/dashboard', 'layout');
  
  return { success: true, site: siteData };
}
