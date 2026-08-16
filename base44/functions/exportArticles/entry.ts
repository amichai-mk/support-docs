import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format, articleIds } = await req.json();

    // Fetch articles
    const articles = await base44.entities.Article.filter({ status: 'published' });
    const articlesToExport = articleIds 
      ? articles.filter(a => articleIds.includes(a.id))
      : articles;

    if (format === 'hubspot') {
      // HubSpot CSV format for bulk import
      const csvRows = [
        ['Name', 'Slug', 'Post Body', 'Meta Description', 'State'].join(',')
      ];

      articlesToExport.forEach(article => {
        const htmlContent = formatArticleToHtml(article);
        csvRows.push([
          `"${escapeCSV(article.title)}"`,
          `"${article.article_id?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"`,
          `"${escapeCSV(htmlContent)}"`,
          `"${escapeCSV(article.issue?.substring(0, 155))}"`,
          '"DRAFT"'
        ].join(','));
      });

      return new Response(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=hubspot-articles-export.csv'
        }
      });
    }

    if (format === 'zoho') {
      // Zoho CSV format for bulk import
      const csvRows = [
        ['Title', 'Answer', 'Status', 'Permalink'].join(',')
      ];

      articlesToExport.forEach(article => {
        const htmlContent = formatArticleToHtml(article);
        csvRows.push([
          `"${escapeCSV(article.title)}"`,
          `"${escapeCSV(htmlContent)}"`,
          '"Draft"',
          `"${article.article_id?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"`
        ].join(','));
      });

      return new Response(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=zoho-articles-export.csv'
        }
      });
    }

    if (format === 'json') {
      // Generic JSON export
      const exportData = articlesToExport.map(article => ({
        id: article.article_id,
        title: article.title,
        issue: article.issue,
        environment: article.environment,
        cause: article.cause,
        resolutions: article.resolutions,
        product_area: article.product_area,
        tags: article.tags,
        created_date: article.created_date,
        updated_date: article.updated_date,
        html_content: formatArticleToHtml(article),
      }));

      return Response.json(exportData);
    }

    if (format === 'html') {
      // HTML export for manual import
      let html = `<!DOCTYPE html>
<html>
<head>
  <title>Support Docs Articles Export</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .article { border: 1px solid #ddd; padding: 20px; margin-bottom: 30px; page-break-after: always; }
    .article-id { color: #666; font-size: 12px; }
    h1 { color: #1e3a8a; }
    h2 { color: #333; border-bottom: 2px solid #6b7280; padding-bottom: 5px; }
    pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    ol { padding-left: 20px; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
`;

      articlesToExport.forEach(article => {
        html += `<div class="article">
  <p class="article-id">${escapeHtml(article.article_id)}</p>
  <h1>${escapeHtml(article.title)}</h1>
  ${formatArticleToHtml(article)}
</div>
`;
      });

      html += '</body></html>';

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': 'attachment; filename=support-docs-articles-export.html'
        }
      });
    }

    return Response.json({ error: 'Invalid format. Use: hubspot, zoho, json, or html' }, { status: 400 });
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

function escapeCSV(text) {
  if (!text) return '';
  return text.replace(/"/g, '""').replace(/\n/g, ' ');
}