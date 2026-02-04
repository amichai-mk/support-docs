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
      const article = await base44.entities.Article.create({
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <ArticleEditor articleId={articleId} />;
}