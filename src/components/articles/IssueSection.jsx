import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import TextEditorToolbar from './TextEditorToolbar';

export default function IssueSection({ value, onChange, onValidation }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const issues = [];
    
    if (value && value.length > 150) {
      issues.push({
        field: 'issue',
        severity: 'error',
        message: 'Issue too long. Max 150 characters (2 sentences).'
      });
    }
    
    const sentenceCount = (value || '').split(/[.!?]+/).filter(s => s.trim()).length;
    if (sentenceCount > 2) {
      issues.push({
        field: 'issue',
        severity: 'warning',
        message: 'Issue should be max 2 sentences.'
      });
    }
    
    onValidation(issues);
  }, [value, onValidation]);

  const charCount = (value || '').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Issue (Problem Statement) *</CardTitle>
          <span className={`text-sm ${charCount > 150 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            {charCount}/150 characters
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
          <strong>Guidance:</strong> Describe the problem in 1-2 sentences. Be specific and user-focused.
          <br />
          <em>Example: "ALS-certified personnel are not appearing in the crew selection dropdown when creating a new incident."</em>
        </div>
        
        <div>
          <TextEditorToolbar textareaRef={textareaRef} value={value || ''} onChange={onChange} />
          <Textarea
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe the issue clearly and concisely..."
            className="min-h-[100px] rounded-t-none"
          />
        </div>
        
        {charCount > 150 && (
          <div className="flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Issue exceeds 150 characters. Please shorten to 2 sentences or less.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}