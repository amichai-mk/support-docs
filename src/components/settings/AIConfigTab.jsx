import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Eye, EyeOff, Sparkles, Search, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function AIConfigTab({ settings, onSave }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(settings?.openai_api_key || '');
  const [enableAISearch, setEnableAISearch] = useState(settings?.enable_ai_search ?? true);
  const [enableAIAssistant, setEnableAIAssistant] = useState(settings?.enable_ai_assistant ?? true);
  const [enableAutoSuggestions, setEnableAutoSuggestions] = useState(settings?.enable_auto_suggestions ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave('ai_config', {
      openai_api_key: apiKey,
      enable_ai_search: enableAISearch,
      enable_ai_assistant: enableAIAssistant,
      enable_auto_suggestions: enableAutoSuggestions
    });
    setIsSaving(false);
    toast.success('AI configuration saved');
  };

  const maskApiKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            OpenAI API Configuration
          </CardTitle>
          <CardDescription>
            Configure API keys for AI-powered features like search and content assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Your API key is stored securely and used for AI features within the application.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
          <CardDescription>Enable or disable specific AI-powered features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">AI-Powered Search</h4>
                <p className="text-sm text-gray-500">
                  Use AI to find relevant articles based on natural language queries
                </p>
              </div>
            </div>
            <Switch
              checked={enableAISearch}
              onCheckedChange={setEnableAISearch}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">AI Writing Assistant</h4>
                <p className="text-sm text-gray-500">
                  Get AI suggestions while writing article content
                </p>
              </div>
            </div>
            <Switch
              checked={enableAIAssistant}
              onCheckedChange={setEnableAIAssistant}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Auto-Suggestions</h4>
                <p className="text-sm text-gray-500">
                  Automatically suggest improvements for article content
                </p>
              </div>
            </div>
            <Switch
              checked={enableAutoSuggestions}
              onCheckedChange={setEnableAutoSuggestions}
            />
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