/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Settings, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BusinessRule, useDataStore } from '@/store/dataStore';

const RULE_TYPES = [
  { value: 'co-run', label: 'Co-run Tasks', description: 'Tasks that must run together' },
  { value: 'phase-restriction', label: 'Phase Restriction', description: 'Limit tasks to specific phases' },
  { value: 'load-limit', label: 'Load Limit', description: 'Maximum workload per worker' },
  { value: 'dependency', label: 'Task Dependency', description: 'Task execution order requirements' },
];

interface RuleFormProps {
  onSubmit: (rule: Omit<BusinessRule, 'id'>) => void;
  onCancel: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ onSubmit, onCancel }) => {
  const [ruleType, setRuleType] = useState<string>('');
  const [ruleName, setRuleName] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleType || !ruleName) return;

    onSubmit({
      type: ruleType as BusinessRule['type'],
      name: ruleName,
      config,
      enabled: true,
    });

    // Reset form
    setRuleType('');
    setRuleName('');
    setConfig({});
  };

  const renderConfigFields = () => {
    switch (ruleType) {
      case 'co-run':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="tasks">Task IDs (comma separated)</Label>
              <Input
                id="tasks"
                placeholder="T1, T2, T3"
                value={config.tasks || ''}
                onChange={(e) => setConfig({ ...config, tasks: e.target.value })}
              />
            </div>
          </div>
        );
      case 'phase-restriction':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phase">Phase</Label>
              <Select value={config.phase || ''} onValueChange={(value) => setConfig({ ...config, phase: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phase1">Phase 1</SelectItem>
                  <SelectItem value="phase2">Phase 2</SelectItem>
                  <SelectItem value="phase3">Phase 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="allowedTasks">Allowed Task IDs</Label>
              <Input
                id="allowedTasks"
                placeholder="T1, T5, T8"
                value={config.allowedTasks || ''}
                onChange={(e) => setConfig({ ...config, allowedTasks: e.target.value })}
              />
            </div>
          </div>
        );
      case 'load-limit':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="maxLoad">Maximum Load</Label>
              <Input
                id="maxLoad"
                type="number"
                placeholder="8"
                value={config.maxLoad || ''}
                onChange={(e) => setConfig({ ...config, maxLoad: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="workerIds">Worker IDs (comma separated)</Label>
              <Input
                id="workerIds"
                placeholder="W1, W2, W3"
                value={config.workerIds || ''}
                onChange={(e) => setConfig({ ...config, workerIds: e.target.value })}
              />
            </div>
          </div>
        );
      case 'dependency':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="prerequisite">Prerequisite Task</Label>
              <Input
                id="prerequisite"
                placeholder="T1"
                value={config.prerequisite || ''}
                onChange={(e) => setConfig({ ...config, prerequisite: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dependent">Dependent Task</Label>
              <Input
                id="dependent"
                placeholder="T2"
                value={config.dependent || ''}
                onChange={(e) => setConfig({ ...config, dependent: e.target.value })}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className='space-y-2'>
        <Label htmlFor="ruleType">Rule Type</Label>
        <Select value={ruleType} onValueChange={setRuleType}>
          <SelectTrigger>
            <SelectValue placeholder="Select rule type" />
          </SelectTrigger>
          <SelectContent>
            {RULE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div  className='space-y-2'>
        <Label htmlFor="ruleName">Rule Name</Label>
        <Input
          id="ruleName"
          placeholder="Enter a descriptive name"
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
        />
      </div>

      {renderConfigFields()}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={!ruleType || !ruleName}>
          Create Rule
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export const BusinessRulesSection: React.FC = () => {
  const { businessRules, addBusinessRule, updateBusinessRule, removeBusinessRule } = useDataStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateRule = (rule: Omit<BusinessRule, 'id'>) => {
    const newRule = {
      ...rule,
      id: crypto.randomUUID(),
    };
    addBusinessRule(newRule);
    setIsCreateDialogOpen(false);
    toast("Rule Created", {
      description: `${rule.name} has been added to your business rules.`,
    });
  };

  const handleToggleRule = (id: string, enabled: boolean) => {
    updateBusinessRule(id, { enabled });
    toast(`${enabled ? "Rule Enabled" : "Rule Disabled"}`,{
      description: "Business rule status updated.",
    });
  };

  const handleDeleteRule = (id: string) => {
    removeBusinessRule(id);
    toast("Rule Deleted",{
      description: "Business rule has been removed.",
    });
  };

  const generateRulesConfig = () => {
    const config = {
      rules: businessRules.filter(rule => rule.enabled),
      generatedAt: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-rules.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("Configuration Downloaded", {
      description: "business-rules.json has been saved to your downloads.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Business Rules</h2>
          <p className="text-muted-foreground">
            Define and manage business rules for your data processing workflow.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateRulesConfig} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl space-y-5">
              <DialogHeader>
                <DialogTitle>Create Business Rule</DialogTitle>
              </DialogHeader>
              <RuleForm
                onSubmit={handleCreateRule}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Active Rules
                <Badge variant="secondary">{businessRules.filter(r => r.enabled).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {businessRules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No business rules defined yet</p>
                  <p className="text-sm">Click Add Rule to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {businessRules.map((rule) => (
                    <div key={rule.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => handleToggleRule(rule.id, enabled)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant="outline">
                            {RULE_TYPES.find(t => t.value === rule.type)?.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Object.entries(rule.config).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rule Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RULE_TYPES.map((type) => (
                <div key={type.value} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{type.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                  {type.value !== RULE_TYPES[RULE_TYPES.length - 1].value && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
