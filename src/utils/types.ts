/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DataRow {
  [key: string]: string | number | boolean;
}

export type Client = {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string[];
  AttributesJSON: string;
  [key: string]: any;
};

export type Worker = {
  WorkerID: string;
  WorkerName: string;
  Skills: string[] | string;
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
  WorkerGroup?: string;
  QualificationLevel?: string;
  [key: string]: any;
};

export type Task = {
  TaskID: string;
  TaskName: string;
  Category?: string;
  Duration: number;
  RequiredSkills: string[];
  PreferredPhases: number[]; // normalized
  MaxConcurrent: number;
  [key: string]: any;
};

export interface ValidationError {
  row: number;
  column: string;
  type: "duplicate" | "missing" | "invalid" | "reference" | "format" | "out-of-range";
  message: string;
  severity?: "error" | "warning";
}

