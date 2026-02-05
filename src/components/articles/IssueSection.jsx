import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import TextEditorToolbar from './TextEditorToolbar';

export default function IssueSection({ value, onChange, onValidation }) {
  const textareaRef = useRef(null);
  const onValidationRef = useRef(onValidation);
  onValidationRef.current = onValidation;

  useEffect(() => {
    const issues = [];
    onValidationRef.current(issues);
  }, [value]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue (Problem Statement) *</CardTitle>
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
        

      </CardContent>
    </Card>
  );
}