import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleIds, categoryId } = await req.json();
    
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      return Response.json({ error: 'Zoho credentials not configured' }, { status: 400 });
    }

    // Get access token from refresh token
    const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return Response.json({ error: 'Failed to get Zoho access token' }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Fetch articles to sync
    const articles = await base44.entities.Article.filter({ status: 'published' });
    const articlesToSync = articleIds 
      ? articles.filter(a => articleIds.includes(a.id))
      : articles;

    const results = [];

    for (const article of articlesToSync) {
      // Format article content for Zoho
      const htmlContent = formatArticleToHtml(article);

      // Create knowledge base article in Zoho Desk
      const response = await fetch('https://desk.zoho.com/api/v1/articles', {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title,
          answer: htmlContent,
          status: 'Draft',
          categoryId: categoryId || undefined,
          permalink: article.article_id?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      });

      const result = await response.json();
      results.push({
        articleId: article.id,
        title: article.title,
        success: response.ok,
        zohoId: result.id,
        error: response.ok ? null : result.message,
      });
    }

    return Response.json({ 
      success: true, 
      synced: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function formatArticleToHtml(article) {
  let html = '';
  
  if (article.issue) {
    html += `<h2>Issue</h2><p>${escapeHtml(article.issue)}</p>`;
  }
  
  if (article.environment) {
    html += `<h2>Environment</h2><pre>${escapeHtml(article.environment)}</pre>`;
  }
  
  if (article.cause) {
    html += `<h2>Cause</h2><p>${escapeHtml(article.cause)}</p>`;
  }
  
  if (article.resolutions?.length > 0) {
    html += `<h2>Resolution</h2>`;
    article.resolutions.forEach((res, i) => {
      if (res.steps?.length > 0) {
        if (article.resolutions.length > 1) {
          html += `<h3>${escapeHtml(res.title || `Option ${i + 1}`)}</h3>`;
        }
        html += '<ol>';
        res.steps.forEach(step => {
          const stepText = typeof step === 'string' ? step : step?.text || '';
          html += `<li>${escapeHtml(stepText)}</li>`;
        });
        html += '</ol>';
        if (res.verification) {
          html += `<p><strong>Verification:</strong> ${escapeHtml(res.verification)}</p>`;
        }
      }
    });
  }
  
  return html;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}