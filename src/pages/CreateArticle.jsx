import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ArticleEditor from '../components/articles/ArticleEditor';

export default function CreateArticle() {
  const navigate = useNavigate();
  const [articleId, setArticleId] = useState(null);

  useEffect(() => {
    // Create initial draft article
    const initializeArticle = async () => {
      // Get count of existing articles to generate next ID
      const allArticles = await base44.entities.Article.list();
      const nextNumber = allArticles.length + 1;
      const articleId = `KCS-${String(nextNumber).padStart(4, '0')}`;
      
      const article = await base44.entities.Article.create({
        article_id: articleId,
        title: 'Untitled Article',
        issue: '',
        status: 'draft',
        resolution_steps: [],
        tags: []
      });
      setArticleId(article.id);
    };
    
    initializeArticle();
  }, []);

  if (!articleId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <ArticleEditor articleId={articleId} />;
}