/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDataStore } from "@/store/dataStore";
import { useState } from "react";

function useFilterData() {
  const { clients, tasks, workers, setClients, setTasks, setWorkers } = useDataStore();

  const [originalData, setOriginalData] = useState({
    clients: [...clients],
    workers: [...workers],
    tasks: [...tasks],
  });

  // Flexible operator matching
  const matchesFilter = (item: any, filter: any): boolean => {
    const fieldValue = item[filter.field];
    const filterValue = filter.value;

    switch (filter.operator) {
      case "==":
        return fieldValue === filterValue;
      case "!=":
        return fieldValue !== filterValue;
      case ">":
        return parseFloat(fieldValue) > parseFloat(filterValue);
      case "<":
        return parseFloat(fieldValue) < parseFloat(filterValue);
      case ">=":
        return parseFloat(fieldValue) >= parseFloat(filterValue);
      case "<=":
        return parseFloat(fieldValue) <= parseFloat(filterValue);
      case "includes":
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(filterValue);
        } else if (typeof fieldValue === "string") {
          return fieldValue
            .split(",")
            .map((s: string) => s.trim())
            .includes(filterValue);
        }
        return false;
      case "notIncludes":
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(filterValue);
        } else if (typeof fieldValue === "string") {
          return !fieldValue
            .split(",")
            .map((s: string) => s.trim())
            .includes(filterValue);
        }
        return true;
      case "range": {
        const [min, max] = filterValue;
        const value = parseFloat(fieldValue);
        return value >= min && value <= max;
      }
      case "exists":
        return fieldValue !== undefined && fieldValue !== null;
      case "notExists":
        return fieldValue === undefined || fieldValue === null;
      case "startsWith":
        return String(fieldValue).startsWith(filterValue);
      case "endsWith":
        return String(fieldValue).endsWith(filterValue);
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
      default:
        return true;
    }
  };

  const applyFilters = (filters: any) => {
    if (filters.entities?.client) {
      const filteredClients = clients.filter((client) =>
        filters.entities.client.every((filter: any) => matchesFilter(client, filter))
      );
      setClients(filteredClients);
    }

    if (filters.entities?.worker) {
      const filteredWorkers = workers.filter((worker) =>
        filters.entities.worker.every((filter: any) => matchesFilter(worker, filter))
      );
      setWorkers(filteredWorkers);
    }

    if (filters.entities?.task) {
      const filteredTasks = tasks.filter((task) =>
        filters.entities.task.every((filter: any) => matchesFilter(task, filter))
      );
      setTasks(filteredTasks);
    }
  };

  const resetFilters = () => {
    setClients([...originalData.clients]);
    setWorkers([...originalData.workers]);
    setTasks([...originalData.tasks]);
  };

  return {
    applyFilters,
    resetFilters,
    originalData,
    setOriginalData,
  };
}

export default useFilterData;
