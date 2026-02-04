import React from 'react';
import ArticleEditor from '../components/articles/ArticleEditor';

export default function EditArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  if (!articleId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Article not found</p>
      </div>
    );
  }

  return <ArticleEditor articleId={articleId} />;
}