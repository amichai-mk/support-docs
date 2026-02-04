import React from 'react';
import ArticleEditor from '../components/articles/ArticleEditor';

export default function EditArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  if (!articleId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Article not found</p>
      </div>
    );
  }

  return <ArticleEditor articleId={articleId} />;
}