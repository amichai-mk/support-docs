import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lightbulb, Database } from 'lucide-react';
import TextEditorToolbar from './TextEditorToolbar';

const TEMPLATE = `Web: Settings > Personnel
Table: Personnel
Frequency: Consistent
Interfaces: Mobile and web`;

export default function EnvironmentSection({ value, onChange, onValidation, database, onDatabaseChange }) {
  const textareaRef = useRef(null);
  const onValidationRef = useRef(onValidation);
  onValidationRef.current = onValidation;

  useEffect(() => {
    const issues = [];
    
    if (!database || database.trim() === '') {
      issues.push({
        field: 'environment',
        severity: 'error',
        message: 'Database acronym is required'
      });
    }
    
    if (value) {
      if (!value.includes('Web:') && !value.includes('Back-Office:')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing Web: or Back-Office: label'
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
    }
    
    onValidationRef.current(issues);
  }, [value, database]);

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
      <CardContent className="space-y-4">
        {/* Database Acronym - Separate Required Field */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Label className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4" />
            Database Acronym <span className="text-red-500">*</span>
          </Label>
          <Input
            value={database || ''}
            onChange={(e) => onDatabaseChange(e.target.value.toUpperCase())}
            placeholder="e.g., CLMA"
            className="font-mono max-w-[200px] bg-white"
            maxLength={10}
          />
          <p className="text-xs text-amber-700 mt-1">Used in the article ID (e.g., KCS-PER-0001-CLMA)</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900 space-y-2">
          <div>
            <strong>Format:</strong> Use labels for each field:
          </div>
          <div className="bg-white p-2 rounded border border-blue-300 text-xs font-mono">
            Web: Settings &gt; Personnel<br />
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