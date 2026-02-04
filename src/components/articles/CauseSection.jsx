import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import ReactQuill from 'react-quill';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['clean']
  ]
};

const formats = ['bold', 'italic', 'underline', 'list', 'bullet', 'align'];

// Strip HTML tags for character counting
const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
};

export default function CauseSection({ value, onChange, onValidation }) {
  const plainText = stripHtml(value);
  const charCount = plainText.length;

  useEffect(() => {
    const issues = [];
    
    if (charCount > 300) {
      issues.push({
        field: 'cause',
        severity: 'error',
        message: 'Cause too long. Focus on root cause only (max 300 characters).'
      });
    }
    
    onValidation(issues);
  }, [value, charCount, onValidation]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Cause (Root Cause Analysis)</CardTitle>
          <span className={`text-sm ${charCount > 300 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            {charCount}/300 characters
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
          <strong>Guidance:</strong> Explain the root cause. Focus on WHY the issue occurs, not how to fix it.
          <br />
          <em>Example: "The system requires both Certification Level and License Number fields to be populated before personnel appears in crew selection."</em>
        </div>
        
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder="Explain the root cause of the issue..."
          className="bg-white"
        />
        
        {charCount > 300 && (
          <div className="flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Cause exceeds 300 characters. Focus on the root cause only.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}