/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Users, CheckSquare } from "lucide-react";
import * as XLSX from "xlsx";
import { useDataStore } from "@/store/dataStore";
import { toast } from "sonner";

interface FileUploadZoneProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onFileUpload: (data: any[]) => void;
  accept: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  title,
  description,
  icon,
  onFileUpload,
  accept,
}) => {
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;

        try {
          const workbook = XLSX.read(data, { type: "binary" });
          console.log(workbook,"workBook")
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonArray = XLSX.utils.sheet_to_json(worksheet);

          console.log(jsonArray);
          onFileUpload(jsonArray);

          toast("File uploaded successfully", {
            description: `${file.name} has been processed with ${jsonArray.length} rows.`,
          });
        } catch (error: any) {
          toast("Upload failed", {
            description:
              error.message || "An error occurred while reading the file.",
          });
        }
      };

      reader.readAsBinaryString(file); // 👈 Important!
    },
    [onFileUpload]
  );

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const FileUploadSection: React.FC = () => {
  const { setClients, setWorkers, setTasks } = useDataStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Upload Data Files
        </h2>
        <p className="text-muted-foreground">
          Upload your CSV or XLSX files to get started with data cleaning and
          validation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadZone
          title="Clients Data"
          description="Upload your clients.csv or clients.xlsx file"
          icon={<Users className="w-6 h-6 text-primary" />}
          onFileUpload={setClients}
          accept=".csv,.xlsx,.xls"
        />

        <FileUploadZone
          title="Workers Data"
          description="Upload your workers.csv or workers.xlsx file"
          icon={<FileText className="w-6 h-6 text-primary" />}
          onFileUpload={setWorkers}
          accept=".csv,.xlsx,.xls"
        />

        <FileUploadZone
          title="Tasks Data"
          description="Upload your tasks.csv or tasks.xlsx file"
          icon={<CheckSquare className="w-6 h-6 text-primary" />}
          onFileUpload={setTasks}
          accept=".csv,.xlsx,.xls"
        />
      </div>
    </div>
  );
};
