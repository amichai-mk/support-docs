import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleIds } = await req.json();
    const accessToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN');

    if (!accessToken) {
      return Response.json({ error: 'HubSpot access token not configured' }, { status: 400 });
    }

    // Fetch articles to sync
    const articles = await base44.entities.Article.filter({ status: 'published' });
    const articlesToSync = articleIds 
      ? articles.filter(a => articleIds.includes(a.id))
      : articles;

    const results = [];

    for (const article of articlesToSync) {
      // Format article content for HubSpot
      const htmlContent = formatArticleToHtml(article);

      // Create or update knowledge base article in HubSpot
      const response = await fetch('https://api.hubapi.com/cms/v3/blogs/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: article.title,
          slug: article.article_id?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          postBody: htmlContent,
          state: 'DRAFT',
          metaDescription: article.issue?.substring(0, 155),
        }),
      });

      const result = await response.json();
      results.push({
        articleId: article.id,
        title: article.title,
        success: response.ok,
        hubspotId: result.id,
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