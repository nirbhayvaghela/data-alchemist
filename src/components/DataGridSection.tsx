/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "@/store/dataStore";
import {
  CheckSquare,
  Download,
  Edit,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { DataRow } from "@/utils/types";
import { useValidations } from "@/hooks/useValidations";
import TooltipWrapper from "./ui-elements/TooltipWrapper";
import { useQueryThroughAPI } from "@/hooks/apis/useQueryThroughAPI";
import useFilterData from "@/hooks/use-filterData";
import * as XLSX from "xlsx";

interface EditableCellProps {
  value: any;
  onSave: (value: any) => void;
  hasError?: boolean;
  error?: string;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  error = "",
  hasError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const cellContent = (
    <div
      className={`group flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/50 min-h-[32px] ${
        hasError ? "border border-destructive bg-destructive/10" : ""
      }`}
      onClick={() => setIsEditing(true)}
    >
      <span className="text-sm">{value || "—"}</span>
      <Edit className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
    </div>
  );

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className="h-8 text-sm"
        autoFocus
      />
    );
  }

  return hasError ? (
    <TooltipWrapper content={error}>{cellContent}</TooltipWrapper>
  ) : (
    cellContent
  );
};

interface DataTableProps {
  data: DataRow[];
  tableName: "clients" | "workers" | "tasks";
  title: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, tableName, title }) => {
  const { updateCell, validationErrors } = useDataStore();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary">0 rows</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No data uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(data[0] || {});
  const getError = (rowIndex: number, column: string) => {
    return validationErrors.find(
      (error) => error.row === rowIndex && error.column === column
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant="secondary">{data.length} rows</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs">
                    #
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b hover:bg-muted/25 transition-colors"
                  >
                    <td className="px-2 py-1 text-xs text-muted-foreground">
                      {rowIndex + 1}
                    </td>
                    {columns.map((column) => (
                      <td key={column} className="px-2 py-1">
                        <EditableCell
                          value={row[column]}
                          onSave={(value) =>
                            updateCell(tableName, rowIndex, column, value)
                          }
                          error={getError(rowIndex, column)?.message}
                          hasError={!!getError(rowIndex, column)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DataGridSection: React.FC = () => {
  const { clients, workers, tasks, validationErrors } = useDataStore();
  const [aiQuery, setAiQuery] = useState("");
  const { runAllValidations } = useValidations(clients, workers, tasks);
  const { queryDataWithAI, isLoading } = useQueryThroughAPI();
  const { applyFilters, resetFilters, setOriginalData } = useFilterData();

  const runValidation = () => {
    if (clients.length === 0 || workers.length === 0 || tasks.length === 0) {
      toast.error(
        "No data to validate. Please upload data for clients, workers, and tasks first."
      );
      return;
    }

    runAllValidations();

    console.log(validationErrors.length, "lenth");

    toast("Validation Complete", {
      description: `Found ${validationErrors.length} issues across all data tables.`,
    });
  };

  const handleAIFilter = async () => {
    const res = await queryDataWithAI(aiQuery);
    if (res.filters) {
      applyFilters(res.filters);
      toast.success("AI filter applied", {
        description: `Showing filtered results for: "${aiQuery}"`,
        action: {
          label: "Reset",
          onClick: () => resetFilters(),
        },
      });
    } else {
      toast.info("No filters were applied");
    }
  };

  const generateRulesConfig = () => {
    // 1. Convert each JSON to sheet
    const clientSheet = XLSX.utils.json_to_sheet(clients);
    const workerSheet = XLSX.utils.json_to_sheet(workers);
    const taskSheet = XLSX.utils.json_to_sheet(tasks);

    // 2. Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, clientSheet, "clients");
    XLSX.utils.book_append_sheet(workbook, workerSheet, "workers");
    XLSX.utils.book_append_sheet(workbook, taskSheet, "tasks");

    // 3. Write file
    XLSX.writeFile(workbook, "data-export.xlsx");

    toast("Exported Excel", {
      description: "data-export.xlsx with 3 sheets has been saved.",
    });

    // toast("Configuration Downloaded", {
    //   description: "business-rules.json has been saved to your downloads.",
    // });
  };

  // Store original data when component mounts
  useEffect(() => {
    setOriginalData({
      clients: [...clients],
      workers: [...workers],
      tasks: [...tasks],
    });
  }, [clients, workers, tasks, setOriginalData]);

  return (
    <div className=" flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Data Preview & Editing
          </h2>
          <p className="text-muted-foreground">
            View and edit your uploaded data. Click on any cell to make changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Input
              placeholder="Filter data using AI "
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAIFilter()}
              className="pl-10 pr-20 border-neutral-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Button
              onClick={handleAIFilter}
              disabled={isLoading || !aiQuery.trim()}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3"
              variant="ghost"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Query
                </>
              )}
            </Button>
          </div>
          <Button onClick={runValidation} className="w-fit">
            <CheckSquare className="w-4 h-4 mr-2" />
            Run Validation
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <DataTable data={clients} tableName="clients" title="Clients Data" />
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <DataTable data={workers} tableName="workers" title="Workers Data" />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <DataTable data={tasks} tableName="tasks" title="Tasks Data" />
        </TabsContent>
      </Tabs>

      <Button
        onClick={generateRulesConfig}
        variant="outline"
        className="ml-auto"
      >
        <Download className="w-4 h-4 mr-2 " />
        Export Config
      </Button>
    </div>
  );
};
