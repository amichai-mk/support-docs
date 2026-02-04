import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Sparkles, Loader2, X } from 'lucide-react';

export default function AISearchBar({ onSearch, onAISuggestions }) {
  const [query, setQuery] = useState('');
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const handleRegularSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleAISearch = async () => {
    if (!query.trim()) return;
    
    setIsAISearching(true);
    setAiSuggestions(null);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a KCS (Knowledge-Centered Service) article suggestion assistant for EPR FireWorks support team.
        
Based on this support query: "${query}"

Suggest 3 potential KCS article topics that would help resolve this issue. For each suggestion provide:
1. A clear, concise title
2. A brief description of what the article should cover
3. Key keywords for searchability

Focus on actionable, solution-oriented articles following KCS methodology.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });
      
      setAiSuggestions(result.suggestions);
      if (onAISuggestions) {
        onAISuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('AI search failed:', error);
    } finally {
      setIsAISearching(false);
    }
  };

  const clearSuggestions = () => {
    setAiSuggestions(null);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleRegularSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search articles or describe an issue for AI suggestions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <Button type="submit" variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button 
          type="button" 
          onClick={handleAISearch}
          disabled={isAISearching || !query.trim()}
          className="bg-[#c41230] hover:bg-[#a30f28] text-white"
        >
          {isAISearching ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          AI Suggest
        </Button>
      </form>

      {aiSuggestions && (
        <Card className="border-[#c41230]/30 dark:border-[#c41230]/50 bg-[#c41230]/5 dark:bg-[#c41230]/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-[#c41230] dark:text-[#ff6b7a]">
                <Sparkles className="w-4 h-4" />
                AI Article Suggestions
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={clearSuggestions} className="h-6 w-6">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-white dark:bg-[#1a2a6c] rounded-lg border border-[#0e1b55]/20 dark:border-[#0e1b55]"
                >
                  <h4 className="font-medium text-[#0e1b55] dark:text-white">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{suggestion.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {suggestion.keywords?.map((keyword, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-0.5 bg-[#0e1b55]/10 dark:bg-[#0e1b55] text-[#0e1b55] dark:text-white rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}