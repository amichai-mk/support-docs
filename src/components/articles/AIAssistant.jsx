import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles, Loader2, Copy, Check, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIAssistant({ formData, onApplySuggestion }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [copied, setCopied] = useState({});

  const generateSuggestion = async (type) => {
    setLoading(true);
    setSuggestion(null);

    try {
      let promptText = '';
      
      if (type === 'full') {
        promptText = `You are a KCS (Knowledge-Centered Service) article writer for EPR FireWorks support software.
        
Based on this user description: "${prompt}"

Generate a complete KCS article with these sections:
- title: A clear, searchable title (max 60 chars)
- issue: Problem statement in 1-2 sentences (max 150 chars)
- environment: Technical context using this format:
  Back-Office: [navigation path]
  Table: [affected table]
  Frequency: [how often it occurs]
  Interfaces: [affected interfaces]
- cause: Root cause explanation (max 300 chars)
- resolution_steps: Array of 3-7 clear, actionable steps (each step should be a single action)
- verification: How to verify the fix worked

Be specific to emergency services/EMS software context.`;
      } else if (type === 'improve_issue') {
        promptText = `Improve this KCS article issue statement to be clearer and more user-focused. Keep it under 150 characters and 2 sentences max.

Current issue: "${formData.issue || 'Not provided'}"
Title: "${formData.title || 'Not provided'}"

Return only the improved issue text, nothing else.`;
      } else if (type === 'improve_cause') {
        promptText = `Improve this KCS article cause/root cause explanation. Focus on WHY the issue occurs. Keep it under 300 characters.

Current cause: "${formData.cause || 'Not provided'}"
Issue: "${formData.issue || 'Not provided'}"

Return only the improved cause text, nothing else.`;
      } else if (type === 'improve_steps') {
        promptText = `Improve these resolution steps for a KCS article. Each step should be a single, clear action. Aim for 5-7 steps max.

Current steps: ${JSON.stringify(formData.resolution_steps || [])}
Issue: "${formData.issue || 'Not provided'}"

Return a JSON array of improved step strings, nothing else. Example: ["Step 1", "Step 2", "Step 3"]`;
      }

      const schema = type === 'full' ? {
        type: 'object',
        properties: {
          title: { type: 'string' },
          issue: { type: 'string' },
          environment: { type: 'string' },
          cause: { type: 'string' },
          resolution_steps: { type: 'array', items: { type: 'string' } },
          verification: { type: 'string' }
        }
      } : type === 'improve_steps' ? {
        type: 'object',
        properties: {
          steps: { type: 'array', items: { type: 'string' } }
        }
      } : {
        type: 'object',
        properties: {
          text: { type: 'string' }
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: promptText,
        response_json_schema: schema
      });

      if (type === 'full') {
        setSuggestion({ type: 'full', data: result });
      } else if (type === 'improve_steps') {
        setSuggestion({ type: 'steps', data: result.steps });
      } else {
        setSuggestion({ type, data: result.text });
      }
    } catch (error) {
      toast.error('Failed to generate suggestion');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (field, value) => {
    onApplySuggestion(field, value);
    toast.success(`Applied to ${field}`);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
  };

  const applyFullSuggestion = () => {
    if (suggestion?.data) {
      const { title, issue, environment, cause, resolution_steps, verification } = suggestion.data;
      if (title) onApplySuggestion('title', title);
      if (issue) onApplySuggestion('issue', issue);
      if (environment) onApplySuggestion('environment', environment);
      if (cause) onApplySuggestion('cause', cause);
      if (resolution_steps) onApplySuggestion('resolution_steps', resolution_steps.map(s => ({ text: s, image: null })));
      if (verification) onApplySuggestion('verification', verification);
      toast.success('Applied all suggestions');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Article Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Generate Full Article */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Generate Full Article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Describe the issue in plain language... e.g., 'Users can't see ALS certified personnel in crew dropdown when creating incidents'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={() => generateSuggestion('full')} 
                disabled={loading || !prompt.trim()}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                Generate Article
              </Button>
            </CardContent>
          </Card>

          {/* Quick Improvements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Improve Existing Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateSuggestion('improve_issue')}
                  disabled={loading || !formData.issue}
                >
                  Improve Issue
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateSuggestion('improve_cause')}
                  disabled={loading || !formData.cause}
                >
                  Improve Cause
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateSuggestion('improve_steps')}
                  disabled={loading || !formData.resolution_steps?.length}
                >
                  Improve Steps
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggestion Display */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          )}

          {suggestion && !loading && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-900">AI Suggestion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestion.type === 'full' && suggestion.data && (
                  <>
                    {Object.entries(suggestion.data).map(([key, value]) => (
                      <div key={key} className="bg-white rounded p-3 border">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase">{key.replace('_', ' ')}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => applySuggestion(key, Array.isArray(value) ? value.map(s => ({ text: s, image: null })) : value)}
                          >
                            {copied[key] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {Array.isArray(value) ? value.map((s, i) => `${i + 1}. ${s}`).join('\n') : value}
                        </p>
                      </div>
                    ))}
                    <Button onClick={applyFullSuggestion} className="w-full bg-purple-600 hover:bg-purple-700">
                      Apply All Suggestions
                    </Button>
                  </>
                )}

                {suggestion.type === 'improve_issue' && (
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm text-gray-700 mb-2">{suggestion.data}</p>
                    <Button size="sm" onClick={() => applySuggestion('issue', suggestion.data)}>
                      Apply to Issue
                    </Button>
                  </div>
                )}

                {suggestion.type === 'improve_cause' && (
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm text-gray-700 mb-2">{suggestion.data}</p>
                    <Button size="sm" onClick={() => applySuggestion('cause', suggestion.data)}>
                      Apply to Cause
                    </Button>
                  </div>
                )}

                {suggestion.type === 'steps' && Array.isArray(suggestion.data) && (
                  <div className="bg-white rounded p-3 border">
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1 mb-2">
                      {suggestion.data.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                    <Button size="sm" onClick={() => applySuggestion('resolution_steps', suggestion.data.map(s => ({ text: s, image: null })))}>
                      Apply to Steps
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}