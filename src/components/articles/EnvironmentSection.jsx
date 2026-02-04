import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import ReactQuill from 'react-quill';

const TEMPLATE_HTML = `<p><strong>Back-Office:</strong> Settings &gt; Personnel</p>
<p><strong>Table:</strong> Personnel</p>
<p><strong>Frequency:</strong> Consistent</p>
<p><strong>Interfaces:</strong> Mobile and web</p>`;

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
  ]
};

const formats = ['bold', 'italic', 'underline'];

// Strip HTML tags for validation
const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
};

export default function EnvironmentSection({ value, onChange, onValidation }) {
  const plainText = stripHtml(value);
  const charCount = plainText.length;

  useEffect(() => {
    const issues = [];
    
    if (value) {
      // Check for required labels in HTML content
      if (!value.includes('<strong>Back-Office:</strong>') && !value.includes('Back-Office:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Back-Office: label'
        });
      }
      
      if (!value.includes('<strong>Table:</strong>') && !value.includes('Table:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Table: label'
        });
      }
      
      if (!value.includes('<strong>Frequency:</strong>') && !value.includes('Frequency:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Frequency: label'
        });
      }
      
      if (!value.includes('<strong>Interfaces:</strong>') && !value.includes('Interfaces:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Interfaces: label'
        });
      }
      
      if (charCount < 100) {
        issues.push({
          field: 'environment',
          severity: 'warning',
          message: 'Environment section seems incomplete (min 100 characters recommended)'
        });
      }
      if (charCount > 300) {
        issues.push({
          field: 'environment',
          severity: 'warning',
          message: 'Environment section too long (max 300 characters recommended)'
        });
      }
    }
    
    onValidation(issues);
  }, [value, charCount, onValidation]);

  const insertTemplate = () => {
    onChange(TEMPLATE_HTML);
  };

  const hasContent = plainText.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Environment (Conditions & Context)</CardTitle>
          {!hasContent && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={insertTemplate}
            >
              Insert Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900 space-y-2">
          <div>
            <strong>Format:</strong> Use bold labels for each field:
          </div>
          <div className="bg-white p-2 rounded border border-blue-300 text-xs">
            <p><strong>Back-Office:</strong> Settings &gt; Personnel</p>
            <p><strong>Table:</strong> Personnel</p>
            <p><strong>Frequency:</strong> Consistent</p>
            <p><strong>Interfaces:</strong> Mobile and web</p>
          </div>
          <div className="flex items-start gap-2 text-blue-800">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Tip: Select text and click <strong>B</strong> to make it bold.</span>
          </div>
        </div>

        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder="Insert template or type environment details..."
          className="bg-white"
        />
      </CardContent>
    </Card>
  );
}