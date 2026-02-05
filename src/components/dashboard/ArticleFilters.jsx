import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

export default function ArticleFilters({ statusFilter, productAreaFilter, onStatusChange, onProductAreaChange }) {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const loadModules = async () => {
      const settings = await base44.entities.AppSettings.filter({ setting_key: 'template_config' });
      if (settings.length > 0 && settings[0].setting_value?.module_options) {
        setModules(settings[0].setting_value.module_options);
      }
    };
    loadModules();
  }, []);

  return (
    <div className="flex gap-3">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px] dark:bg-[#1a2a6c] dark:border-[#0e1b55] dark:text-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="review">Review</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select value={productAreaFilter} onValueChange={onProductAreaChange}>
        <SelectTrigger className="w-[160px] dark:bg-[#1a2a6c] dark:border-[#0e1b55] dark:text-white">
          <SelectValue placeholder="Module" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modules</SelectItem>
          {modules.map((module) => (
            <SelectItem key={module.value} value={module.label}>
              {module.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}