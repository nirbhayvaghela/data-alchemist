/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDataStore } from "@/store/dataStore";

import {
  CheckSquare,
  AlertTriangle,
  AlertCircle,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useValidations } from "@/hooks/useValidations";
import { useAutoCorrection } from "@/hooks/apis/useAutoCorrection";

export const ValidationSection: React.FC = () => {
  const {
    clients,
    workers,
    tasks,
    validationErrors,
    setClients,
    setTasks,
    setWorkers,
    setValidationErrors,
  } = useDataStore();
  const { runAllValidations } = useValidations(clients, workers, tasks);
  const { autoCorrect, isLoading } = useAutoCorrection();
  const runValidation = () => {
    if (clients.length === 0 || workers.length === 0 || tasks.length === 0) {
      toast.error(
        "No data to validate. Please upload data for clients, workers, and tasks first."
      );
      return;
    }

    runAllValidations();

    console.log(validationErrors.length, "lenth");

    // setValidationErrors(errors);
    toast("Validation Complete", {
      description: `Found ${validationErrors.length} issues across all data tables.`,
      //   variant: errors.length > 0 ? "destructive" : "default",
    });
  };

  const autoCorrectErrors = async () => {
    // Example auto-correction logic
    const res = await autoCorrect(validationErrors); // your array of errors
    if (res.length > 0) {
      // Create copies of the current state
      const updatedClients = [...clients];
      const updatedWorkers = [...workers];
      const updatedTasks = [...tasks];

      // Apply each fix
      res.forEach((fix: any) => {
        switch (fix.table) {
          case "clients":
            updatedClients[fix.row] = {
              ...updatedClients[fix.row],
              [fix.column]: fix.value,
            };
            break;
          case "workers":
            updatedWorkers[fix.row] = {
              ...updatedWorkers[fix.row],
              [fix.column]: fix.value,
            };
            break;
          case "tasks":
            updatedTasks[fix.row] = {
              ...updatedTasks[fix.row],
              [fix.column]: fix.value,
            };
            break;
        }
      });

      // Update Zustand state
      setClients(updatedClients);
      setWorkers(updatedWorkers);
      setTasks(updatedTasks);

      // Clear fixed errors
      const remainingErrors = validationErrors.filter(
        (error:any) =>
          !res.some(
            (fix:any) =>
              // fix.table === error.table &&
              fix.row === error.row &&
              fix.column === error.column
          )
      );
      setValidationErrors(remainingErrors);

      toast.success(`Applied ${res.length} corrections`);
    } else {
      toast.info("No corrections needed");
    }
  };

  const errorsByType = validationErrors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const errorsBySeverity = validationErrors.reduce((acc, error) => {
    const severity = error.severity ?? "unknown";
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Data Validation
        </h2>
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
                  <span className="text-sm text-muted-foreground">
                    Auto-validate
                  </span>
                  {/* <Switch
                    checked={autoValidate}
                    onCheckedChange={setAutoValidate}
                  /> */}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={runValidation} className="flex-1">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Run Validation
                </Button>
                <Button
                  onClick={autoCorrectErrors}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Correcting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Auto-correct
                    </>
                  )}
                </Button>
              </div>

              {validationErrors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found {validationErrors.length} validation issues. Review
                    the errors below and fix them manually or try
                    auto-correction.
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
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      {error.severity === "error" ? (
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              error.severity === "error"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            Row {error.row + 1}
                          </Badge>
                          <Badge variant="outline">{error.column}</Badge>
                          <Badge variant="outline">{error.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {error.message}
                        </p>
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
                    <Badge variant="destructive">
                      {errorsBySeverity.error || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Warnings</span>
                    <Badge variant="secondary">
                      {errorsBySeverity.warning || 0}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">By Type</h4>
                <div className="space-y-2">
                  {Object.entries(errorsByType).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm capitalize">
                        {type.replace("-", " ")}
                      </span>
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
