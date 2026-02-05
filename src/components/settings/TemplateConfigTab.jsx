import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw, Plus, X, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const DEFAULT_ENVIRONMENT_TEMPLATE = `Back-Office: Settings > Personnel
Table: Personnel
Frequency: Consistent
Interfaces: Mobile and web`;

const DEFAULT_ID_FORMAT = 'KCS-{MODULE}-{NUMBER}-DB';

const MODULE_OPTIONS = [
  { value: 'PER', label: 'Personnel' },
  { value: 'INC', label: 'Incidents' },
  { value: 'REP', label: 'Reporting' },
  { value: 'SCH', label: 'Scheduling' },
  { value: 'INV', label: 'Inventory' },
  { value: 'TRN', label: 'Training' },
  { value: 'ADM', label: 'Admin' },
  { value: 'INT', label: 'Integrations' },
  { value: 'GEN', label: 'General' },
];

export default function TemplateConfigTab({ settings, onSave }) {
  const [environmentTemplate, setEnvironmentTemplate] = useState(
    settings?.environment_template || DEFAULT_ENVIRONMENT_TEMPLATE
  );
  const [articleIdFormat, setArticleIdFormat] = useState(
    settings?.article_id_format || DEFAULT_ID_FORMAT
  );
  const [moduleOptions, setModuleOptions] = useState(
    settings?.module_options || MODULE_OPTIONS
  );
  const [newModuleCode, setNewModuleCode] = useState('');
  const [newModuleLabel, setNewModuleLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [modulesExpanded, setModulesExpanded] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave('template_config', {
      environment_template: environmentTemplate,
      article_id_format: articleIdFormat,
      module_options: moduleOptions
    });
    setIsSaving(false);
    toast.success('Template configuration saved');
  };

  const handleReset = () => {
    setEnvironmentTemplate(DEFAULT_ENVIRONMENT_TEMPLATE);
    setArticleIdFormat(DEFAULT_ID_FORMAT);
    setModuleOptions(MODULE_OPTIONS);
  };

  const addModuleOption = () => {
    if (newModuleCode && newModuleLabel) {
      setModuleOptions([...moduleOptions, { value: newModuleCode.toUpperCase(), label: newModuleLabel }]);
      setNewModuleCode('');
      setNewModuleLabel('');
    }
  };

  const removeModuleOption = (index) => {
    setModuleOptions(moduleOptions.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(moduleOptions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setModuleOptions(items);
  };

  // Generate preview of the ID format
  const getFormatPreview = () => {
    return articleIdFormat
      .replace('{MODULE}', 'PER')
      .replace('{NUMBER}', '0001')
      .replace('{YEAR}', new Date().getFullYear())
      .replace('{MONTH}', String(new Date().getMonth() + 1).padStart(2, '0'));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article ID Configuration</CardTitle>
          <CardDescription>Configure how article IDs are generated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="format">Article ID Format</Label>
            <Input
              id="format"
              value={articleIdFormat}
              onChange={(e) => setArticleIdFormat(e.target.value)}
              placeholder="KCS-{MODULE}-{NUMBER}-DB"
              className="max-w-md font-mono"
            />
            <p className="text-sm text-gray-500">
              Available placeholders: <code className="bg-gray-100 px-1 rounded">{'{MODULE}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{NUMBER}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{YEAR}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{MONTH}'}</code>
            </p>
            <p className="text-sm text-gray-600">
              Preview: <span className="font-mono font-semibold">{getFormatPreview()}</span>
            </p>
          </div>

          <div className="space-y-3">
            <Collapsible open={modulesExpanded} onOpenChange={setModulesExpanded}>
              <div className="flex items-center justify-between">
                <Label>Module Identifiers ({moduleOptions.length})</Label>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {modulesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2 mt-2">
                <p className="text-sm text-gray-500">Drag to reorder. The order here determines the dropdown order.</p>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="modules" direction="vertical">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="space-y-2 max-h-[300px] overflow-y-auto"
                      >
                        {moduleOptions.map((mod, index) => (
                          <Draggable key={mod.value} draggableId={mod.value} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center gap-2 p-2 rounded-lg border ${
                                  snapshot.isDragging ? 'bg-blue-50 border-blue-300 shadow-lg' : 'bg-white border-gray-200'
                                }`}
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <span className="font-mono font-semibold text-sm">{mod.value}</span>
                                <span className="text-gray-500 text-sm">- {mod.label}</span>
                                <button 
                                  onClick={() => removeModuleOption(index)}
                                  className="ml-auto text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CollapsibleContent>
            </Collapsible>
            <div className="flex gap-2 items-center">
              <Input
                value={newModuleCode}
                onChange={(e) => setNewModuleCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="Code (e.g., PER)"
                className="w-32 font-mono"
                maxLength={4}
              />
              <Input
                value={newModuleLabel}
                onChange={(e) => setNewModuleLabel(e.target.value)}
                placeholder="Label (e.g., Personnel)"
                className="w-48"
              />
              <Button size="sm" variant="outline" onClick={addModuleOption} disabled={!newModuleCode || !newModuleLabel}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
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