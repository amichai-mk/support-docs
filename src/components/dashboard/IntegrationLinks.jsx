import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, MessageSquare } from 'lucide-react';

export default function IntegrationLinks() {
  const integrations = [
    {
      name: 'RingCentral',
      description: 'Phone & messaging integration',
      icon: Phone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      status: 'Coming Soon',
      url: '#',
    },
    {
      name: 'HubSpot',
      description: 'CRM & ticketing integration',
      icon: MessageSquare,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      status: 'Coming Soon',
      url: '#',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map((integration) => (
          <div 
            key={integration.name}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${integration.bgColor}`}>
                <integration.icon className={`w-4 h-4 ${integration.color}`} />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{integration.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{integration.description}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              {integration.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}