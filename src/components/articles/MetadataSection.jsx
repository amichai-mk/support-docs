import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export default function MetadataSection({ formData, onChange }) {
  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...(formData.tags || []), tagInput.trim()];
      onChange('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = (formData.tags || []).filter(tag => tag !== tagToRemove);
    onChange('tags', newTags);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Article Title *</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g., ALS Personnel Not Showing in Crew Selection"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="product_area">Product Area</Label>
          <Select 
            value={formData.product_area || ''} 
            onValueChange={(value) => onChange('product_area', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select product area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dashboard">Dashboard</SelectItem>
              <SelectItem value="Hydrants">Hydrants</SelectItem>
              <SelectItem value="Properties">Properties</SelectItem>
              <SelectItem value="Incidents">Incidents</SelectItem>
              <SelectItem value="EPCR">EPCR</SelectItem>
              <SelectItem value="Inventory">Inventory</SelectItem>
              <SelectItem value="BI">BI</SelectItem>
              <SelectItem value="Map View">Map View</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Staffworks">Staffworks</SelectItem>
              <SelectItem value="MIH">MIH</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
              <SelectItem value="Department Parameters">Department Parameters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2 mt-1">
            {(formData.tags || []).map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type tag and press Enter"
          />
        </div>
      </CardContent>
    </Card>
  );
}