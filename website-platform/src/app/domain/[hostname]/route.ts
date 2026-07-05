import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { hostname: string } }
) {
  const hostname = params.hostname;
  
  if (!hostname) {
    return new NextResponse('Missing hostname parameter', { status: 400 });
  }

  const supabase = await createClient();

  // Find the site by custom_domain
  const { data: site, error } = await supabase
    .from('sites')
    .select('id, user_id, html_content, status')
    .eq('custom_domain', hostname)
    .single();

  if (error || !site) {
    return new NextResponse(`Site not found for domain ${hostname}`, { status: 404 });
  }

  if (!site.html_content) {
    return new NextResponse('Site is generating...', { status: 200 });
  }

  // Embed Live chat support widget iframe automatically (Phase 12)
  const embedCode = `
    <!-- Live Support Chat widget iframe -->
    <script>
      (function() {
        var container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '99999';
        container.style.transition = 'all 0.3s ease';
        document.body.appendChild(container);

        var iframe = document.createElement('iframe');
        iframe.src = 'https://resolve.bet/support/embed?siteId=${site.id}';
        iframe.style.width = '65px';
        iframe.style.height = '65px';
        iframe.style.border = '0';
        iframe.style.background = 'transparent';
        iframe.style.transition = 'all 0.3s ease';
        container.appendChild(iframe);

        window.addEventListener('message', function(event) {
          if (event.data === 'open-support') {
            iframe.style.width = '330px';
            iframe.style.height = '430px';
          } else if (event.data === 'close-support') {
            iframe.style.width = '65px';
            iframe.style.height = '65px';
          }
        });
      })();
    </script>

    <!-- Powered by Resolve.bet Referral Badge -->
    <a href="https://resolve.bet/signup?ref=${site.user_id}" target="_blank" style="position: fixed; bottom: 20px; left: 20px; z-index: 99999; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.15); padding: 10px 14px; border-radius: 12px; font-family: sans-serif; font-size: 11px; font-weight: 600; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); backdrop-filter: blur(8px); transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      <span style="display: inline-block; width: 8px; height: 8px; background: #6366f1; border-radius: 50%;"></span>
      Powered by Resolve.bet
    </a>
  `;
  
  let finalHtml = site.html_content;
  if (finalHtml.includes('</body>')) {
    finalHtml = finalHtml.replace('</body>', `${embedCode}</body>`);
  } else {
    finalHtml += embedCode;
  }

  // Return the raw generated HTML
  return new NextResponse(finalHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
