import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus, GripVertical, Trash2, Lightbulb, Image, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ResolutionSection({ resolutions = [], onResolutionsChange, onValidation }) {
  const [showConsolidationHelper, setShowConsolidationHelper] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [expandedResolutions, setExpandedResolutions] = useState([0]);

  // Initialize with one empty resolution if none exist
  useEffect(() => {
    if (resolutions.length === 0) {
      onResolutionsChange([{ title: '', steps: [], verification: '' }]);
    }
  }, []);

  useEffect(() => {
    const issues = [];
    
    resolutions.forEach((res, resIndex) => {
      const stepCount = res.steps?.length || 0;
      
      if (stepCount === 7) {
        issues.push({
          field: `resolution-${resIndex}`,
          severity: 'warning',
          message: `⚠️ Resolution ${resIndex + 1}: Consider consolidation (7 steps)`
        });
      } else if (stepCount === 8) {
        issues.push({
          field: `resolution-${resIndex}`,
          severity: 'warning',
          message: `⚠️ Resolution ${resIndex + 1}: Complex workflow (8 steps)`
        });
      } else if (stepCount === 9) {
        issues.push({
          field: `resolution-${resIndex}`,
          severity: 'error',
          message: `🛑 Resolution ${resIndex + 1}: Must consolidate (9 steps)`
        });
      } else if (stepCount >= 10) {
        issues.push({
          field: `resolution-${resIndex}`,
          severity: 'error',
          message: `🛑 Resolution ${resIndex + 1}: BLOCKED (10+ steps)`
        });
      }
      
      if (!res.verification || res.verification.trim() === '') {
        issues.push({
          field: `resolution-${resIndex}`,
          severity: 'warning',
          message: `⚠️ Resolution ${resIndex + 1}: Add verification statement`
        });
      }
    });

    if (resolutions.length === 0 || (resolutions.length === 1 && (!resolutions[0].steps || resolutions[0].steps.length === 0))) {
      issues.push({
        field: 'resolution',
        severity: 'error',
        message: 'At least one resolution with steps is required'
      });
    }
    
    onValidation(issues);
  }, [resolutions, onValidation]);

  const handleAddResolution = () => {
    const newResolutions = [...resolutions, { title: '', steps: [], verification: '' }];
    onResolutionsChange(newResolutions);
    setExpandedResolutions([...expandedResolutions, newResolutions.length - 1]);
  };

  const handleRemoveResolution = (resIndex) => {
    if (resolutions.length <= 1) return;
    const newResolutions = resolutions.filter((_, i) => i !== resIndex);
    onResolutionsChange(newResolutions);
    setExpandedResolutions(expandedResolutions.filter(i => i !== resIndex).map(i => i > resIndex ? i - 1 : i));
  };

  const handleUpdateResolutionTitle = (resIndex, value) => {
    const newResolutions = [...resolutions];
    newResolutions[resIndex] = { ...newResolutions[resIndex], title: value };
    onResolutionsChange(newResolutions);
  };

  const handleUpdateVerification = (resIndex, value) => {
    const newResolutions = [...resolutions];
    newResolutions[resIndex] = { ...newResolutions[resIndex], verification: value };
    onResolutionsChange(newResolutions);
  };

  const handleAddStep = (resIndex) => {
    const newResolutions = [...resolutions];
    newResolutions[resIndex] = {
      ...newResolutions[resIndex],
      steps: [...(newResolutions[resIndex].steps || []), { text: '', image: null }]
    };
    onResolutionsChange(newResolutions);
  };

  const handleUpdateStep = (resIndex, stepIndex, value) => {
    const newResolutions = [...resolutions];
    const steps = [...(newResolutions[resIndex].steps || [])];
    if (typeof steps[stepIndex] === 'string') {
      steps[stepIndex] = { text: value, image: null };
    } else {
      steps[stepIndex] = { ...steps[stepIndex], text: value };
    }
    newResolutions[resIndex] = { ...newResolutions[resIndex], steps };
    onResolutionsChange(newResolutions);
  };

  const handleRemoveStep = (resIndex, stepIndex) => {
    const newResolutions = [...resolutions];
    newResolutions[resIndex] = {
      ...newResolutions[resIndex],
      steps: newResolutions[resIndex].steps.filter((_, i) => i !== stepIndex)
    };
    onResolutionsChange(newResolutions);
  };

  const handleImageUpload = async (resIndex, stepIndex, file) => {
    if (!file) return;
    
    setUploading(`${resIndex}-${stepIndex}`);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newResolutions = [...resolutions];
      const steps = [...(newResolutions[resIndex].steps || [])];
      if (typeof steps[stepIndex] === 'string') {
        steps[stepIndex] = { text: steps[stepIndex], image: file_url };
      } else {
        steps[stepIndex] = { ...steps[stepIndex], image: file_url };
      }
      newResolutions[resIndex] = { ...newResolutions[resIndex], steps };
      onResolutionsChange(newResolutions);
      toast.success('Screenshot uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = (resIndex, stepIndex) => {
    const newResolutions = [...resolutions];
    const steps = [...(newResolutions[resIndex].steps || [])];
    if (typeof steps[stepIndex] === 'object') {
      steps[stepIndex] = { ...steps[stepIndex], image: null };
      newResolutions[resIndex] = { ...newResolutions[resIndex], steps };
      onResolutionsChange(newResolutions);
    }
  };

  const handlePaste = async (resIndex, stepIndex, e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageUpload(resIndex, stepIndex, file);
        }
        break;
      }
    }
  };

  const handleDragEnd = (resIndex, result) => {
    if (!result.destination) return;
    
    const newResolutions = [...resolutions];
    const steps = Array.from(newResolutions[resIndex].steps || []);
    const [removed] = steps.splice(result.source.index, 1);
    steps.splice(result.destination.index, 0, removed);
    newResolutions[resIndex] = { ...newResolutions[resIndex], steps };
    
    onResolutionsChange(newResolutions);
  };

  const toggleExpanded = (index) => {
    if (expandedResolutions.includes(index)) {
      setExpandedResolutions(expandedResolutions.filter(i => i !== index));
    } else {
      setExpandedResolutions([...expandedResolutions, index]);
    }
  };

  const getStepText = (step) => typeof step === 'string' ? step : step?.text || '';
  const getStepImage = (step) => typeof step === 'object' ? step?.image : null;

  const hasMultipleResolutions = resolutions.length > 1;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Resolution (Step-by-Step Fix)</CardTitle>
              {hasMultipleResolutions && (
                <p className="text-sm text-gray-500 mt-1">
                  Multiple resolution options available
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleAddResolution}>
              <Plus className="w-4 h-4 mr-1" />
              Add Alternative Resolution
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            <strong>Guidance:</strong> Each step should be a single, clear action. Maximum 7 steps recommended.
            <br />
            <span className="text-blue-700">💡 For issues with multiple solutions, add alternative resolutions.</span>
          </div>

          {resolutions.map((resolution, resIndex) => {
            const stepCount = resolution.steps?.length || 0;
            const isExpanded = expandedResolutions.includes(resIndex);

            return (
              <Collapsible key={resIndex} open={isExpanded} onOpenChange={() => toggleExpanded(resIndex)}>
                <div className={`border rounded-lg ${hasMultipleResolutions ? 'bg-gray-50' : ''}`}>
                  {hasMultipleResolutions && (
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 rounded-t-lg">
                        <div className="flex items-center gap-3 flex-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <div className="flex-1">
                            <Input
                              value={resolution.title || ''}
                              onChange={(e) => handleUpdateResolutionTitle(resIndex, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder={`Resolution ${resIndex + 1} Title (e.g., "Option A: Quick Fix")`}
                              className="font-semibold"
                            />
                          </div>
                          <span className="text-sm text-gray-600 mx-2">
                            {stepCount} steps
                          </span>
                          {resolutions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleRemoveResolution(resIndex); }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                  )}

                  <CollapsibleContent>
                    <div className={`space-y-4 ${hasMultipleResolutions ? 'p-4 pt-0' : ''}`}>
                      {/* Step count indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Steps: <span className={`font-bold ${stepCount >= 9 ? 'text-red-600' : stepCount >= 7 ? 'text-orange-600' : ''}`}>
                            {stepCount}
                          </span>/7
                        </span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              stepCount >= 9 ? 'bg-red-600' : 
                              stepCount >= 7 ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((stepCount / 7) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Warning Messages */}
                      {stepCount >= 7 && (
                        <div className={`flex items-start gap-2 p-3 rounded-lg border ${
                          stepCount >= 10 ? 'bg-red-50 border-red-200 text-red-900' :
                          stepCount >= 9 ? 'bg-red-50 border-red-300 text-red-800' :
                          stepCount >= 8 ? 'bg-orange-50 border-orange-200 text-orange-900' :
                          'bg-yellow-50 border-yellow-200 text-yellow-900'
                        }`}>
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold">
                              {stepCount >= 10 ? '🛑 BLOCKED: Cannot Publish' :
                               stepCount >= 9 ? '🛑 Must Consolidate' :
                               stepCount >= 8 ? '⚠️ Complex Workflow Detected' :
                               '⚠️ Consider Consolidation'}
                            </div>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-current mt-1"
                              onClick={() => setShowConsolidationHelper(true)}
                            >
                              View Consolidation Tips
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Steps List */}
                      <DragDropContext onDragEnd={(result) => handleDragEnd(resIndex, result)}>
                        <Droppable droppableId={`steps-${resIndex}`}>
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                              {(resolution.steps || []).map((step, stepIndex) => (
                                <Draggable key={stepIndex} draggableId={`step-${resIndex}-${stepIndex}`} index={stepIndex}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="border rounded-lg p-3 bg-white"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                          <GripVertical className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600 w-6">{stepIndex + 1}.</span>
                                        <Input
                                          value={getStepText(step)}
                                          onChange={(e) => handleUpdateStep(resIndex, stepIndex, e.target.value)}
                                          onPaste={(e) => handlePaste(resIndex, stepIndex, e)}
                                          placeholder={`Step ${stepIndex + 1} (paste screenshot with Ctrl+V)`}
                                          className="flex-1"
                                        />
                                        <input
                                          type="file"
                                          id={`step-image-${resIndex}-${stepIndex}`}
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(resIndex, stepIndex, e.target.files[0])}
                                          className="hidden"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => document.getElementById(`step-image-${resIndex}-${stepIndex}`).click()}
                                          disabled={uploading === `${resIndex}-${stepIndex}`}
                                          title="Add screenshot"
                                        >
                                          {uploading === `${resIndex}-${stepIndex}` ? (
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Image className="w-4 h-4 text-gray-500" />
                                          )}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveStep(resIndex, stepIndex)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                      
                                      {getStepImage(step) && (
                                        <div className="mt-2 ml-12 relative inline-block">
                                          <img 
                                            src={getStepImage(step)} 
                                            alt={`Step ${stepIndex + 1} screenshot`}
                                            className="max-h-32 rounded border"
                                          />
                                          <button
                                            onClick={() => handleRemoveImage(resIndex, stepIndex)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      {stepCount < 10 && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleAddStep(resIndex)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Step
                        </Button>
                      )}

                      {/* Verification */}
                      <div className="pt-4 border-t">
                        <Label>Verification Statement *</Label>
                        <p className="text-sm text-gray-600 mb-2">
                          Describe the expected result after completing all steps
                        </p>
                        <Input
                          value={resolution.verification || ''}
                          onChange={(e) => handleUpdateVerification(resIndex, e.target.value)}
                          placeholder="e.g., Personnel appears in crew selection"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>

      {/* Consolidation Helper Dialog */}
      <Dialog open={showConsolidationHelper} onOpenChange={setShowConsolidationHelper}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Step Consolidation Tips</DialogTitle>
            <DialogDescription>
              Strategies to reduce steps while maintaining clarity:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Combine Sequential Navigation</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="text-red-600">❌ Don't: 1. Click Settings 2. Click Personnel 3. Click Edit</div>
                    <div className="text-green-600">✅ Do: 1. Navigate to Settings &gt; Personnel &gt; Edit</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Merge Related Actions</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="text-red-600">❌ Don't: 1. Enter Level 2. Enter License</div>
                    <div className="text-green-600">✅ Do: 1. Complete Level and License fields</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}