import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_ENVIRONMENT_TEMPLATE = `Back-Office: Settings > Personnel
Table: Personnel
Frequency: Consistent
Interfaces: Mobile and web`;

export default function TemplateConfigTab({ settings, onSave }) {
  const [environmentTemplate, setEnvironmentTemplate] = useState(
    settings?.environment_template || DEFAULT_ENVIRONMENT_TEMPLATE
  );
  const [articleIdPrefix, setArticleIdPrefix] = useState(
    settings?.article_id_prefix || 'KCS'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave('template_config', {
      environment_template: environmentTemplate,
      article_id_prefix: articleIdPrefix
    });
    setIsSaving(false);
    toast.success('Template configuration saved');
  };

  const handleReset = () => {
    setEnvironmentTemplate(DEFAULT_ENVIRONMENT_TEMPLATE);
    setArticleIdPrefix('KCS');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article ID Configuration</CardTitle>
          <CardDescription>Configure how article IDs are generated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">Article ID Prefix</Label>
            <Input
              id="prefix"
              value={articleIdPrefix}
              onChange={(e) => setArticleIdPrefix(e.target.value)}
              placeholder="KCS"
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500">
              Example: {articleIdPrefix}-001, {articleIdPrefix}-002
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Section Template</CardTitle>
          <CardDescription>Default template for the Environment section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={environmentTemplate}
            onChange={(e) => setEnvironmentTemplate(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
          />
          <p className="text-sm text-gray-500">
            This template will be inserted when users click "Insert Template" in the Environment section.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}