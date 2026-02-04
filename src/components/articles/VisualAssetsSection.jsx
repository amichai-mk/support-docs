import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Upload, Image, Video, Youtube, Code } from 'lucide-react';
import { toast } from 'sonner';

export default function VisualAssetsSection({ assets = [], onChange }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [newAsset, setNewAsset] = useState({ type: 'image', url: '', caption: '' });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const asset = {
        type: file.type.startsWith('video/') ? 'video' : 'image',
        url: file_url,
        caption: ''
      };
      
      onChange([...assets, asset]);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!newAsset.url.trim()) {
      toast.error('URL is required');
      return;
    }

    onChange([...assets, { ...newAsset }]);
    setNewAsset({ type: 'image', url: '', caption: '' });
    toast.success('Visual asset added');
  };

  const handleRemove = (index) => {
    onChange(assets.filter((_, i) => i !== index));
  };

  const handleUpdateCaption = (index, caption) => {
    const updated = [...assets];
    updated[index] = { ...updated[index], caption };
    onChange(updated);
  };

  const getAssetIcon = (type) => {
    switch(type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'iframe': return <Code className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Assets (Screenshots, Videos, Workflows)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
          <strong>Add visual aids:</strong> Upload screenshots/videos, embed YouTube links, or add Guideflow workflows (iframe).
        </div>

        {/* Asset List */}
        {assets.length > 0 && (
          <div className="space-y-3">
            {assets.map((asset, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
                <div className="flex-shrink-0 pt-1">
                  {getAssetIcon(asset.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">{asset.type}</span>
                    <span className="text-xs text-gray-400 truncate flex-1">{asset.url}</span>
                  </div>
                  <Input
                    placeholder="Add caption (optional)"
                    value={asset.caption || ''}
                    onChange={(e) => handleUpdateCaption(index, e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Asset */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url">
              <Code className="w-4 h-4 mr-2" />
              Add URL/Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-3">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload screenshot or video'}
                </span>
                <span className="text-xs text-gray-500">PNG, JPG, MP4, MOV</span>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-3">
            <div className="space-y-3">
              <div>
                <Label>Asset Type</Label>
                <Select
                  value={newAsset.type}
                  onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Screenshot/Image URL</SelectItem>
                    <SelectItem value="video">Video URL</SelectItem>
                    <SelectItem value="youtube">YouTube Video</SelectItem>
                    <SelectItem value="iframe">Interactive Workflow (Guideflow, iframe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>URL</Label>
                <Input
                  placeholder={
                    newAsset.type === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                    newAsset.type === 'iframe' ? 'https://app.guideflow.com/...' :
                    'https://...'
                  }
                  value={newAsset.url}
                  onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                />
              </div>

              <div>
                <Label>Caption (optional)</Label>
                <Input
                  placeholder="Add a caption"
                  value={newAsset.caption}
                  onChange={(e) => setNewAsset({ ...newAsset, caption: e.target.value })}
                />
              </div>

              <Button onClick={handleAddUrl} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Visual Asset
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}