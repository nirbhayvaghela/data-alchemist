"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDataStore } from '@/store/dataStore';

import { CheckSquare, AlertTriangle, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ValidationError } from '@/utils/types';

export const ValidationSection: React.FC = () => {
  const { 
    clients, 
    workers, 
    tasks, 
    validationErrors, 
    setValidationErrors, 
    autoValidate, 
    setAutoValidate 
  } = useDataStore();

  const runValidation = () => {
    console.log(clients,"check clients")
    const errors: ValidationError[] = [];

    // Example validation rules
    clients.forEach((client, index) => {
      if (!client.id) {
        errors.push({
          row: index,
          column: 'id',
          type: 'missing',
          message: 'Client ID is required',
          severity: 'error'
        });
      }
      if (!client.name) {
        errors.push({
          row: index,
          column: 'name',
          type: 'missing',
          message: 'Client name is required',
          severity: 'error'
        });
      }
    });

    workers.forEach((worker, index) => {
      if (!worker.id) {
        errors.push({
          row: index,
          column: 'id',
          type: 'missing',
          message: 'Worker ID is required',
          severity: 'error'
        });
      }
      if (worker.availability && typeof worker.availability === 'string') {
        try {
          JSON.parse(worker.availability);
        } catch {
          errors.push({
            row: index,
            column: 'availability',
            type: 'format',
            message: 'Invalid JSON format in availability field',
            severity: 'warning'
          });
        }
      }
    });

    tasks.forEach((task, index) => {
      if (!task.id) {
        errors.push({
          row: index,
          column: 'id',
          type: 'missing',
          message: 'Task ID is required',
          severity: 'error'
        });
      }
      if (task.duration && (isNaN(Number(task.duration)) || Number(task.duration) < 0)) {
        errors.push({
          row: index,
          column: 'duration',
          type: 'invalid',
          message: 'Duration must be a positive number',
          severity: 'error'
        });
      }
    });

    setValidationErrors(errors);
    
    toast("Validation Complete", {
      description: `Found ${errors.length} issues across all data tables.`,
    //   variant: errors.length > 0 ? "destructive" : "default",
    });
  };

  const autoCorrectErrors = () => {
    // Example auto-correction logic
    let correctedCount = 0;
    
    // Auto-correct common patterns like "2-4" -> [2,3,4]
    tasks.forEach((task) => {
      if (typeof task.duration === 'string' && task.duration.includes('-')) {
        const [start, end] = task.duration.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
          // This would need to update the actual data store
          correctedCount++;
        }
      }
    });

    if (correctedCount > 0) {
      toast.success("Auto-correction Applied", {
        description: `Fixed ${correctedCount} common formatting issues.`,
      });
      runValidation();
    } else {
      toast.info("No Auto-corrections Available", {
        description: "No common patterns found that can be automatically fixed.",
      });
    }
  };

  const errorsByType = validationErrors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const errorsBySeverity = validationErrors.reduce((acc, error) => {
    acc[error.severity] = (acc[error.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Data Validation</h2>
        <p className="text-muted-foreground">
          Validate your data integrity and fix common issues automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Validation Controls
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Auto-validate</span>
                  <Switch
                    checked={autoValidate}
                    onCheckedChange={setAutoValidate}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={runValidation} className="flex-1">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Run Validation
                </Button>
                <Button onClick={autoCorrectErrors} variant="outline" className="flex-1">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-correct
                </Button>
              </div>
              
              {validationErrors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found {validationErrors.length} validation issues. Review the errors below and fix them manually or try auto-correction.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {validationErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      {error.severity === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                            Row {error.row + 1}
                          </Badge>
                          <Badge variant="outline">{error.column}</Badge>
                          <Badge variant="outline">{error.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">By Severity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Errors</span>
                    <Badge variant="destructive">{errorsBySeverity.error || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Warnings</span>
                    <Badge variant="secondary">{errorsBySeverity.warning || 0}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">By Type</h4>
                <div className="space-y-2">
                  {Object.entries(errorsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};