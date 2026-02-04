import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';

const TEMPLATE = `**Back-Office:** Settings > Personnel  
**Table:** Personnel  
**Frequency:** Consistent  
**Interfaces:** Mobile and web`;

export default function EnvironmentSection({ value, onChange, onValidation }) {
  useEffect(() => {
    const issues = [];
    
    if (value) {
      if (!value.includes('**Back-Office:**')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing **Back-Office:** label'
        });
      }
      
      if (!value.includes('**Table:**')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing **Table:** label'
        });
      }
      
      if (!value.includes('**Frequency:**')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing **Frequency:** label'
        });
      }
      
      if (!value.includes('**Interfaces:**')) {
        issues.push({
          field: 'environment',
          severity: 'error',
          message: 'Missing **Interfaces:** label'
        });
      }
      
      // Check for two-space line breaks
      const lines = value.split('\n');
      const hasProperLineBreaks = lines.some(line => line.endsWith('  '));
      if (!hasProperLineBreaks && lines.length > 1) {
        issues.push({
          field: 'environment',
          severity: 'warning',
          message: 'Add two spaces at end of lines for proper formatting'
        });
      }
      
      // Check for wrong navigation
      if (value.includes('→')) {
        issues.push({
          field: 'environment',
          severity: 'warning',
          message: 'Use > for navigation (Settings > Table)'
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
          {!value && (
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
            <strong>Format:</strong> Use bold key-value format with line breaks:
          </div>
          <div className="font-mono text-xs bg-white p-2 rounded border border-blue-300">
            **Back-Office:** Settings &gt; Personnel<br />
            **Table:** Personnel<br />
            **Frequency:** Consistent<br />
            **Interfaces:** Mobile and web
          </div>
          <div className="flex items-start gap-2 text-blue-800">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Tip: Add two spaces at end of each line before pressing Enter for line breaks.</span>
          </div>
        </div>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="mt-3">
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Insert template or type environment details..."
              className="min-h-[150px] font-mono text-sm"
            />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-3">
            <div className="border rounded-lg p-4 min-h-[150px] bg-gray-50 prose prose-sm max-w-none">
              {value ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <p className="text-gray-400">No content to preview</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}