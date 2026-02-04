import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock } from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync articles with HubSpot Knowledge Base and track customer interactions',
    icon: '🟠',
    status: 'coming_soon',
    features: [
      'Automatic article sync',
      'Customer ticket linking',
      'Analytics integration'
    ]
  },
  {
    id: 'ringcentral',
    name: 'RingCentral',
    description: 'Connect phone support with knowledge articles for agent assistance',
    icon: '📞',
    status: 'coming_soon',
    features: [
      'Real-time article suggestions',
      'Call transcription linking',
      'Agent productivity metrics'
    ]
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Publish articles directly to your Confluence workspace',
    icon: '📘',
    status: 'coming_soon',
    features: [
      'One-click publishing',
      'Automatic formatting',
      'Version sync'
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications and search articles directly from Slack',
    icon: '💬',
    status: 'coming_soon',
    features: [
      'Article notifications',
      'Slash command search',
      'Team collaboration'
    ]
  }
];

export default function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Connect your KCS knowledge base with other tools and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTEGRATIONS.map((integration) => (
              <Card key={integration.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{integration.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Coming Soon
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{integration.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Features</p>
                    <ul className="text-sm space-y-1">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button variant="outline" disabled className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
              💡
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Need a different integration?</h3>
              <p className="text-sm text-blue-800 mt-1">
                We're always looking to expand our integration options. If you need to connect 
                with a tool not listed here, please reach out to our support team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}