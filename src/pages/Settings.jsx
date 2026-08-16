import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Settings2, Users, Sparkles, BarChart3, Plug, Upload } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';

import TemplateConfigTab from '@/components/settings/TemplateConfigTab';
import SectionsFieldsTab from '@/components/settings/SectionsFieldsTab';
import UserManagementTab from '@/components/settings/UserManagementTab';
import AIConfigTab from '@/components/settings/AIConfigTab';
import InsightsTab from '@/components/settings/InsightsTab';
import IntegrationsTab from '@/components/settings/IntegrationsTab';
import ExportSyncTab from '@/components/settings/ExportSyncTab';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('templates');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        if (user?.role !== 'admin') {
          navigate(createPageUrl('Dashboard'));
        }
      } catch (error) {
        navigate(createPageUrl('Dashboard'));
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [navigate]);

  const { data: settingsData = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
    enabled: currentUser?.role === 'admin',
  });

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }) => {
      const existing = settingsData.find(s => s.setting_key === key);
      if (existing) {
        return base44.entities.AppSettings.update(existing.id, { setting_value: value });
      } else {
        return base44.entities.AppSettings.create({ setting_key: key, setting_value: value });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['app-settings']);
    },
  });

  const handleSave = async (key, value) => {
    await saveMutation.mutateAsync({ key, value });
  };

  const getSettings = (key) => {
    const setting = settingsData.find(s => s.setting_key === key);
    return setting?.setting_value || {};
  };

  if (isCheckingAuth || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-[84px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('Dashboard'))}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your Support Docs configuration</p>
              </div>
            </div>
            <UserHeader />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Sections</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Config</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Export/Sync</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <TemplateConfigTab 
              settings={getSettings('template_config')} 
              onSave={handleSave} 
            />
          </TabsContent>

          <TabsContent value="sections">
            <SectionsFieldsTab 
              settings={getSettings('sections_config')} 
              onSave={handleSave} 
            />
          </TabsContent>

          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="ai">
            <AIConfigTab 
              settings={getSettings('ai_config')} 
              onSave={handleSave} 
            />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsTab />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="export">
            <ExportSyncTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}