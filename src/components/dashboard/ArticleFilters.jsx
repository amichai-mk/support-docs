import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ArticleFilters({ statusFilter, productAreaFilter, onStatusChange, onProductAreaChange }) {
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
          <SelectValue placeholder="Product Area" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Areas</SelectItem>
          <SelectItem value="Personnel">Personnel</SelectItem>
          <SelectItem value="Incidents">Incidents</SelectItem>
          <SelectItem value="Reporting">Reporting</SelectItem>
          <SelectItem value="Scheduling">Scheduling</SelectItem>
          <SelectItem value="Training">Training</SelectItem>
          <SelectItem value="Administration">Administration</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}