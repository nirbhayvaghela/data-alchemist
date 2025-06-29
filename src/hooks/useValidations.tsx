import { useDataStore } from "@/store/dataStore";
import {
  validateAttributesJSON,
  validatePriorityLevel,
  validateRequestedTaskIDs,
  validateRequiredField,
  validateWorkerSkills,
  validateAvailableSlots,
  validateMaxLoadPerPhase,
  validateDuration,
  validateRequiredSkills,
  validatePreferredPhases,
  validateMaxConcurrent,
  checkDuplicateIDs,
} from "@/utils/helpers/validation-helpers";
import { Client, Task, ValidationError, Worker } from "@/utils/types";
import { useMemo } from "react";

export const useValidations = (
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
) => {
  const { setValidationErrors, validationErrors } = useDataStore();
  return useMemo(() => {
    const validationSummary: string[] = [];

    // Create lookup sets for validation
    const taskIDs = new Set(tasks.map((t) => t.TaskID));
    // const workerIDs = new Set(workers.map((w) => w.WorkerID));

    // 1. Validate Clients
    const validatedClients = (collector: ValidationError[]) => {

      clients.map((client, index) => {
        // Required fields
        const requiredFields = ["ClientID", "ClientName", "PriorityLevel"];
        requiredFields.forEach((field) => {
          const error = validateRequiredField(
            client[field as keyof Client],
            field,
            index
          );
          // console.log(error, "error in validation");
          if (error) collector.push(error);
        });
        const duplicateError = checkDuplicateIDs(
          clients.map((c) => c.ClientID),
          client.ClientID,
          index,
          "ClientID"
        );
        if (duplicateError) collector.push(duplicateError);

        // Priority level
        const priorityError = validatePriorityLevel(
          client.PriorityLevel,
          index
        );
        if (priorityError) collector.push(priorityError);

        // Requested Task IDs
        const requestedTaskError = validateRequestedTaskIDs(
          client.RequestedTaskIDs,
          taskIDs,
          index
        );
        if (requestedTaskError) collector.push(...requestedTaskError);

        // Attributes JSON
        const jsonError = validateAttributesJSON(client.AttributesJSON, index);
        if (jsonError) collector.push(jsonError);
      });

      // setValidationErrors(errors);
    };

    // 2. Validate Workers
    const validatedWorkers = (collector: ValidationError[]) => {
      // const errors: ValidationError[] = [];
      
      workers.map((worker, index) => {
        // Required fields validation
        const requiredFields = [
          "WorkerID",
          "WorkerName",
          "AvailableSlots",
          "MaxLoadPerPhase",
        ];
        requiredFields.forEach((field) => {
          const error = validateRequiredField(
            worker[field as keyof Worker],
            field,
            index
          );
          if (error) collector.push(error);
        });

        // Check for duplicate WorkerIDs
        const duplicateError = checkDuplicateIDs(
          workers.map((w) => w.WorkerID),
          worker.WorkerID,
          index,
          "WorkerID"
        );
        if (duplicateError) collector.push(duplicateError);

        // Skills validation
        const skillsError = validateWorkerSkills(worker.Skills, index);
        if (skillsError) collector.push(skillsError);

        // AvailableSlots validation
        const slotsError = validateAvailableSlots(worker.AvailableSlots, index);
        if (slotsError) collector.push(...slotsError);

        // MaxLoadPerPhase validation
        const maxLoadError = validateMaxLoadPerPhase(
          worker.MaxLoadPerPhase,
          worker.AvailableSlots,
          index
        );
        if (maxLoadError) collector.push(...maxLoadError);
      });
      // setValidationErrors([...validationErrors, ...errors]);
    };

    // 3. Validate Tasks
    const validatedTasks = (collector: ValidationError[]) => {
      // const errors: ValidationError[] = [];
      tasks.map((task, index) => {
        // Required fields validation
        const requiredFields = [
          "TaskID",
          "TaskName",
          "Duration",
          "MaxConcurrent",
        ];
        requiredFields.forEach((field) => {
          const error = validateRequiredField(
            task[field as keyof Task],
            field,
            index
          );
          if (error) collector.push(error);
        });

        // Check for duplicate TaskIDs
        const duplicateError = checkDuplicateIDs(
          tasks.map((t) => t.TaskID),
          task.TaskID,
          index,
          "TaskID"
        );
        if (duplicateError) collector.push(duplicateError);

        // Duration validation
        const durationError = validateDuration(task.Duration, index);
        if (durationError) collector.push(durationError);

        // RequiredSkills validation (cross-reference with workers)
        const skillsError = validateRequiredSkills(
          task.RequiredSkills,
          workers,
          index
        );
        if (skillsError) collector.push(...skillsError);

        // PreferredPhases validation
        const phasesError = validatePreferredPhases(
          task.PreferredPhases,
          index
        );
        if (phasesError) collector.push(...phasesError);

        // MaxConcurrent validation (cross-reference with qualified workers)
        const concurrentError = validateMaxConcurrent(
          task.MaxConcurrent,
          task.RequiredSkills,
          workers,
          index
        );
        if (concurrentError) collector.push(concurrentError);
      });
      // setValidationErrors([...validationErrors, ...errors]);
    };

    const runAllValidations = () => {
      const allErrors: ValidationError[] = [];
      validatedClients(allErrors);
      validatedWorkers(allErrors);
      validatedTasks(allErrors);
      setValidationErrors(allErrors); // single state update
    };

    return {
      runAllValidations,
      validatedClients,
      validatedWorkers,
      validatedTasks,
      validationSummary,
    };
  }, [tasks, clients, setValidationErrors, validationErrors, workers]);
};
