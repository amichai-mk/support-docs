import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_SECTIONS = [
  { key: 'issue', label: 'Issue (Problem Statement)', required: true, maxChars: 150 },
  { key: 'environment', label: 'Environment', required: false, maxChars: 300 },
  { key: 'cause', label: 'Cause (Root Cause)', required: false, maxChars: 300 },
  { key: 'resolution_steps', label: 'Resolution Steps', required: true, maxSteps: 9 },
  { key: 'verification', label: 'Verification', required: true, maxChars: 200 },
  { key: 'visual_assets', label: 'Visual Assets', required: false, maxAssets: 10 },
];

export default function SectionsFieldsTab({ settings, onSave }) {
  const [sections, setSections] = useState(settings?.sections || DEFAULT_SECTIONS);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleRequired = (key) => {
    setSections(prev => prev.map(section => 
      section.key === key ? { ...section, required: !section.required } : section
    ));
  };

  const handleUpdateMaxChars = (key, value) => {
    setSections(prev => prev.map(section => 
      section.key === key ? { ...section, maxChars: parseInt(value) || 0 } : section
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave('sections_config', { sections });
    setIsSaving(false);
    toast.success('Section configuration saved');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article Sections</CardTitle>
          <CardDescription>Configure which sections are required and their character limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{section.label}</h4>
                  <p className="text-sm text-gray-500">Key: {section.key}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  {section.maxChars !== undefined && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`max-${section.key}`} className="text-sm text-gray-600">
                        Max chars:
                      </Label>
                      <Input
                        id={`max-${section.key}`}
                        type="number"
                        value={section.maxChars}
                        onChange={(e) => handleUpdateMaxChars(section.key, e.target.value)}
                        className="w-20"
                      />
                    </div>
                  )}
                  
                  {section.maxSteps !== undefined && (
                    <div className="text-sm text-gray-600">
                      Max steps: {section.maxSteps}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`required-${section.key}`} className="text-sm">
                      Required
                    </Label>
                    <Switch
                      id={`required-${section.key}`}
                      checked={section.required}
                      onCheckedChange={() => handleToggleRequired(section.key)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}