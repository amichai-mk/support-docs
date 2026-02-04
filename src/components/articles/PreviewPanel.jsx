import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { FileText } from 'lucide-react';

export default function PreviewPanel({ formData }) {
  return (
    <Card className="bg-white">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Article Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Title */}
        <div>
          <div className="text-sm font-mono text-gray-500 mb-2">
            Article ID: {formData.article_id || 'Pending'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.title || 'Untitled Article'}</h1>
          {formData.product_area && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {formData.product_area}
            </span>
          )}
        </div>

        {/* Issue */}
        {formData.issue && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-red-500">Issue</h2>
            <p className="text-gray-700">{formData.issue}</p>
          </div>
        )}

        {/* Environment */}
        {formData.environment && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-blue-500">Environment</h2>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{formData.environment}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Cause */}
        {formData.cause && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-yellow-500">Cause</h2>
            <p className="text-gray-700">{formData.cause}</p>
          </div>
        )}

        {/* Resolution */}
        {(formData.resolution_steps?.length > 0 || formData.verification) && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-green-500">Resolution</h2>
            {formData.resolution_steps?.length > 0 && (
              <ol className="list-decimal list-inside space-y-2 mb-4">
                {formData.resolution_steps.map((step, index) => (
                  <li key={index} className="text-gray-700">{step}</li>
                ))}
              </ol>
            )}
            {formData.verification && (
              <p className="text-gray-700 mt-4">
                <strong>Verification:</strong> {formData.verification}.
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {formData.tags?.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}