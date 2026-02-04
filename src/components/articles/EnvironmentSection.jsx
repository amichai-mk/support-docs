import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import TextEditorToolbar from './TextEditorToolbar';

const TEMPLATE = `Back-Office: Settings > Personnel
Table: Personnel
Frequency: Consistent
Interfaces: Mobile and web`;

export default function EnvironmentSection({ value, onChange, onValidation }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const issues = [];
    
    if (value) {
      if (!value.includes('Back-Office:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Back-Office: label'
        });
      }
      
      if (!value.includes('Table:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Table: label'
        });
      }
      
      if (!value.includes('Frequency:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Frequency: label'
        });
      }
      
      if (!value.includes('Interfaces:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Interfaces: label'
        });
      }
      
      const charCount = value.length;
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
  }, [value, onValidation]);

  const insertTemplate = () => {
    onChange(TEMPLATE);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Environment (Conditions & Context)</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={insertTemplate}
          >
            Insert Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900 space-y-2">
          <div>
            <strong>Format:</strong> Use labels for each field:
          </div>
          <div className="bg-white p-2 rounded border border-blue-300 text-xs font-mono">
            Back-Office: Settings &gt; Personnel<br />
            Table: Personnel<br />
            Frequency: Consistent<br />
            Interfaces: Mobile and web
          </div>
          <div className="flex items-start gap-2 text-blue-800">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Tip: Click "Insert Template" to get started quickly.</span>
          </div>
        </div>

        <div>
          <TextEditorToolbar textareaRef={textareaRef} value={value || ''} onChange={onChange} />
          <Textarea
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Insert template or type environment details..."
            className="min-h-[150px] font-mono text-sm rounded-t-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}