/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Task, ValidationError, Worker } from "@/utils/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BusinessRule {
  id: string;
  type: "co-run" | "phase-restriction" | "load-limit" | "dependency";
  name: string;
  config: Record<string, any>;
  enabled: boolean;
}

interface DataStore {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  validationErrors: ValidationError[];
  businessRules: BusinessRule[];
  autoValidate: boolean;
  setClients: (data: Client[]) => void;
  setWorkers: (data: Worker[]) => void;
  setTasks: (data: Task[]) => void;
  updateCell: (
    table: "clients" | "workers" | "tasks",
    rowIndex: number,
    column: string,
    value: any
  ) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  addBusinessRule: (rule: BusinessRule) => void;
  updateBusinessRule: (id: string, rule: Partial<BusinessRule>) => void;
  removeBusinessRule: (id: string) => void;
  setAutoValidate: (enabled: boolean) => void;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      clients: [],
      workers: [],
      tasks: [],
      validationErrors: [],
      businessRules: [],
      autoValidate: true,

      setClients: (data) => set({ clients: data }),
      setWorkers: (data) => set({ workers: data }),
      setTasks: (data) => set({ tasks: data }),

      updateCell: (table, rowIndex, column, value) => {
        const state = get();
        const tableData = [...state[table]];
        tableData[rowIndex] = { ...tableData[rowIndex], [column]: value };
        set({ [table]: tableData });
      },

      setValidationErrors: (errors) => set({ validationErrors: errors }),

      addBusinessRule: (rule) =>
        set((state) => ({ businessRules: [...state.businessRules, rule] })),

      updateBusinessRule: (id, updates) =>
        set((state) => ({
          businessRules: state.businessRules.map((rule) =>
            rule.id === id ? { ...rule, ...updates } : rule
          ),
        })),

      removeBusinessRule: (id) =>
        set((state) => ({
          businessRules: state.businessRules.filter((rule) => rule.id !== id),
        })),

      setAutoValidate: (enabled) => set({ autoValidate: enabled }),
    }),
    {
      name: "data-alchemist-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
