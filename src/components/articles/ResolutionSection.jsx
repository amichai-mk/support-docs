import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus, GripVertical, Trash2, AlertCircle, Lightbulb } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ResolutionSection({ steps = [], verification, onStepsChange, onVerificationChange, onValidation }) {
  const [showConsolidationHelper, setShowConsolidationHelper] = useState(false);

  useEffect(() => {
    const issues = [];
    
    const stepCount = steps.length;
    
    if (stepCount === 7) {
      issues.push({
        field: 'resolution',
        severity: 'warning',
        message: '⚠️ Consider consolidation (7 steps)'
      });
    } else if (stepCount === 8) {
      issues.push({
        field: 'resolution',
        severity: 'warning',
        message: '⚠️ Complex workflow - verify necessity (8 steps)'
      });
    } else if (stepCount === 9) {
      issues.push({
        field: 'resolution',
        severity: 'error',
        message: '🛑 Must consolidate (9 steps)'
      });
    } else if (stepCount >= 10) {
      issues.push({
        field: 'resolution',
        severity: 'error',
        message: '🛑 BLOCKED: Documentation Lead override required (10+ steps)'
      });
    }
    
    if (!verification || verification.trim() === '') {
      issues.push({
        field: 'resolution',
        severity: 'warning',
        message: '⚠️ Add verification statement'
      });
    }
    
    onValidation(issues);
  }, [steps, verification, onValidation]);

  const handleAddStep = () => {
    onStepsChange([...steps, '']);
  };

  const handleUpdateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    onStepsChange(newSteps);
  };

  const handleRemoveStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onStepsChange(newSteps);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const newSteps = Array.from(steps);
    const [removed] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, removed);
    
    onStepsChange(newSteps);
  };

  const stepCount = steps.length;
  const warningLevel = stepCount >= 10 ? 'critical' : stepCount >= 9 ? 'high' : stepCount >= 7 ? 'medium' : 'none';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Resolution (Step-by-Step Fix)</CardTitle>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <p className="text-sm mt-1">
                  {stepCount >= 10 ? 'Too many steps. Documentation Lead override required. Please consolidate to 9 or fewer steps.' :
                   stepCount >= 9 ? 'You have 9 steps. This must be consolidated before publishing.' :
                   stepCount >= 8 ? 'You have 8 steps. Verify all steps are necessary.' :
                   'You have 7 steps. Consider combining related steps.'}
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-current mt-2"
                  onClick={() => setShowConsolidationHelper(true)}
                >
                  View Consolidation Tips
                </Button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            <strong>Guidance:</strong> Each step should be a single, clear action. Maximum 7 steps recommended.
            <br />
            <em>Example: "Navigate to Settings &gt; Personnel" or "Click Save"</em>
          </div>

          {/* Steps List */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {steps.map((step, index) => (
                    <Draggable key={index} draggableId={`step-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-2"
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                          <Input
                            value={step}
                            onChange={(e) => handleUpdateStep(index, e.target.value)}
                            placeholder={`Step ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStep(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
              onClick={handleAddStep}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          )}

          {/* Verification */}
          <div className="pt-4 border-t">
            <Label htmlFor="verification">Verification Statement *</Label>
            <p className="text-sm text-gray-600 mb-2">
              Describe the expected result after completing all steps
            </p>
            <Input
              id="verification"
              value={verification || ''}
              onChange={(e) => onVerificationChange(e.target.value)}
              placeholder="e.g., Personnel appears in crew selection"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Consolidation Helper Dialog */}
      <Dialog open={showConsolidationHelper} onOpenChange={setShowConsolidationHelper}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Step Consolidation Tips</DialogTitle>
            <DialogDescription>
              Here are strategies to reduce the number of steps while maintaining clarity:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Combine Sequential Navigation</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div>
                      <div className="text-red-600">❌ Don't:</div>
                      <div className="ml-4">1. Click Settings<br />2. Click Personnel<br />3. Click Edit</div>
                    </div>
                    <div>
                      <div className="text-green-600">✅ Do:</div>
                      <div className="ml-4">1. Navigate to Settings &gt; Personnel &gt; Edit</div>
                    </div>
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
                    <div>
                      <div className="text-red-600">❌ Don't:</div>
                      <div className="ml-4">1. Enter Certification Level<br />2. Enter License Number</div>
                    </div>
                    <div>
                      <div className="text-green-600">✅ Do:</div>
                      <div className="ml-4">1. Complete Certification Level and License Number fields</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Group Configuration Steps</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div>
                      <div className="text-red-600">❌ Don't:</div>
                      <div className="ml-4">1. Check checkbox A<br />2. Check checkbox B<br />3. Select option C</div>
                    </div>
                    <div>
                      <div className="text-green-600">✅ Do:</div>
                      <div className="ml-4">1. Enable A, B, and select option C</div>
                    </div>
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