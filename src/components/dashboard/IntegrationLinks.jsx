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
      color: 'text-[#c41230]',
      bgColor: 'bg-[#c41230]/10 dark:bg-[#c41230]/20',
      status: 'Coming Soon',
      url: '#',
    },
    {
      name: 'HubSpot',
      description: 'CRM & ticketing integration',
      icon: MessageSquare,
      color: 'text-[#0e1b55] dark:text-white',
      bgColor: 'bg-[#0e1b55]/10 dark:bg-[#0e1b55]',
      status: 'Coming Soon',
      url: '#',
    },
  ];

  return (
    <Card className="border-gray-200 dark:border-[#1a2a6c] dark:bg-[#1a2a6c]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-[#0e1b55] dark:text-white">
          Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map((integration) => (
          <div 
            key={integration.name}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#0e1b55]"
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
            <span className="text-xs text-gray-500 dark:text-gray-300 bg-gray-200 dark:bg-[#1a2a6c] px-2 py-1 rounded">
              {integration.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}