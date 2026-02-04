import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ValidationPanel({ formData, completeness, validationIssues }) {
  const errors = validationIssues.filter(i => i.severity === 'error');
  const warnings = validationIssues.filter(i => i.severity === 'warning');

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-900';
      case 'warning':
        return 'border-orange-200 bg-orange-50 text-orange-900';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-900';
    }
  };

  return (
    <div className="space-y-4">
      {/* Completeness Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completeness Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    completeness === 100 ? 'bg-green-600' :
                    completeness >= 75 ? 'bg-blue-600' :
                    completeness >= 50 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold">{completeness}%</span>
          </div>
          {completeness === 100 ? (
            <div className="flex items-center gap-2 mt-3 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Ready to publish</span>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-3">
              Complete all required fields to reach 100%
            </p>
          )}
        </CardContent>
      </Card>

      {/* Validation Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quality Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {validationIssues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-700 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">All checks passed</span>
            </div>
          ) : (
            <>
              {errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-700">Errors ({errors.length})</h4>
                  {errors.map((issue, index) => (
                    <div key={index} className={`flex items-start gap-2 p-3 border rounded-lg ${getSeverityColor(issue.severity)}`}>
                      {getSeverityIcon(issue.severity)}
                      <span className="text-sm flex-1">{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-orange-700">Warnings ({warnings.length})</h4>
                  {warnings.map((issue, index) => (
                    <div key={index} className={`flex items-start gap-2 p-3 border rounded-lg ${getSeverityColor(issue.severity)}`}>
                      {getSeverityIcon(issue.severity)}
                      <span className="text-sm flex-1">{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Field Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { field: 'title', label: 'Article Title', value: formData.title },
            { field: 'issue', label: 'Issue', value: formData.issue },
            { field: 'environment', label: 'Environment', value: formData.environment },
            { field: 'cause', label: 'Cause', value: formData.cause },
            { field: 'resolution_steps', label: 'Resolution Steps', value: formData.resolution_steps?.length > 0 },
            { field: 'verification', label: 'Verification', value: formData.verification },
          ].map(item => (
            <div key={item.field} className="flex items-center gap-2 text-sm">
              {item.value ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
              <span className={item.value ? 'text-gray-700' : 'text-gray-400'}>
                {item.label}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}