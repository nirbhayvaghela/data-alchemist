/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationError, Worker } from "../types";

// Existing functions from your code...
export const validateRequiredField = (
  value: any,
  fieldName: string,
  row: number
): ValidationError | null => {
  if (
    !value ||
    !value.toString().trim() ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  ) {
    return {
      row,
      column: fieldName,
      type: "missing",
      message: `Missing ${fieldName}`,
      severity: "error",
    };
  }
  return null;
};

export const validatePriorityLevel = (
  priority: number,
  row: number
): ValidationError | null => {
  if (typeof priority !== "number") {
    return {
      row,
      column: "PriorityLevel",
      type: "invalid",
      message: "PriorityLevel must be a number",
      severity: "error",
    };
  }
  if (priority < 1 || priority > 5) {
    return {
      row,
      column: "PriorityLevel",
      type: "out-of-range",
      message: "PriorityLevel must be between 1 and 5",
      severity: "error",
    };
  }
  return null;
};

export const validateRequestedTaskIDs = (
  taskIDs: string[] | string,
  validTaskIDs: Set<string>,
  row: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Convert to array if it's a string
  const taskIDArray = Array.isArray(taskIDs)
    ? taskIDs
    : typeof taskIDs === "string"
    ? taskIDs
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id)
    : [];

  // Validate array format
  if (!Array.isArray(taskIDs) && typeof taskIDs !== "string") {
    errors.push({
      row,
      column: "RequestedTaskIDs",
      type: "invalid",
      message: "RequestedTaskIDs must be an array or comma-separated string",
      severity: "error",
    });
    return errors;
  }

  // Find all invalid TaskIDs
  const invalidIDs = taskIDArray.filter((id) => !validTaskIDs.has(id));

  // Add single error for all invalid IDs if any exist
  if (invalidIDs.length > 0) {
    errors.push({
      row,
      column: "RequestedTaskIDs",
      type: "reference",
      message: `Unknown TaskIDs: ${invalidIDs.join(", ")}`,
      severity: "error",
    });
  }

  return errors;
};

export const validateAttributesJSON = (
  jsonString: string,
  row: number
): ValidationError | null => {
  try {
    JSON.parse(jsonString);
    return null;
  } catch {
    return {
      row,
      column: "AttributesJSON",
      type: "format",
      message: "Invalid JSON in AttributesJSON",
      severity: "error",
    };
  }
};

// NEW VALIDATION FUNCTIONS FOR WORKERS AND TASKS

// Duplicate ID validation
export const checkDuplicateIDs = (
  allIDs: string[],
  currentID: string,
  row: number,
  fieldName: string
): ValidationError | null => {
  const duplicateCount = allIDs.filter((id) => id === currentID).length;
  if (duplicateCount > 1) {
    return {
      row,
      column: fieldName,
      type: "duplicate",
      message: `Duplicate ${fieldName}: ${currentID}`,
      severity: "error",
    };
  }
  return null;
};

// Worker Skills validation
export const validateWorkerSkills = (
  skills: string | string[],
  row: number
): ValidationError | null => {
  // Empty string is valid
  if (skills === "" || skills === null || skills === undefined) {
    return null;
  }

  // Convert to array if it's a string
  let skillsArray: string[];
  if (typeof skills === "string") {
    skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
  } else if (Array.isArray(skills)) {
    skillsArray = skills;
  } else {
    return {
      row,
      column: "Skills",
      type: "invalid",
      message: "Skills must be a comma-separated string or array",
      severity: "error",
    };
  }

  // Validate each skill is a string
  const invalidSkills = skillsArray.filter(
    (skill) => typeof skill !== "string"
  );
  if (invalidSkills.length > 0) {
    return {
      row,
      column: "Skills",
      type: "invalid",
      message: "All skills must be strings",
      severity: "error",
    };
  }

  return null;
};

// AvailableSlots validation
export const validateAvailableSlots = (
  slots: any,
  row: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Parse slots array
  let slotsArray: number[];
  try {
    if (typeof slots === "string") {
      // Handle both "[1,2,3]" and "1,2,3" formats
      const cleanSlots = slots.replace(/[\[\]]/g, "");
      slotsArray = cleanSlots.split(",").map((s) => parseInt(s.trim()));
    } else if (Array.isArray(slots)) {
      slotsArray = slots.map((s) => parseInt(s));
    } else {
      errors.push({
        row,
        column: "AvailableSlots",
        type: "invalid",
        message: "AvailableSlots must be an array or comma-separated string",
        severity: "error",
      });
      return errors;
    }
  } catch {
    errors.push({
      row,
      column: "AvailableSlots",
      type: "format",
      message: "Invalid AvailableSlots format",
      severity: "error",
    });
    return errors;
  }

  // Validate all elements are positive integers
  const invalidSlots = slotsArray.filter(
    (s) => isNaN(s) || s < 1 || !Number.isInteger(s)
  );
  if (invalidSlots.length > 0) {
    errors.push({
      row,
      column: "AvailableSlots",
      type: "invalid",
      message: "All AvailableSlots must be positive integers",
      severity: "error",
    });
  }

  // Check for duplicates
  const uniqueSlots = new Set(slotsArray);
  if (uniqueSlots.size !== slotsArray.length) {
    errors.push({
      row,
      column: "AvailableSlots",
      type: "duplicate",
      message: "AvailableSlots cannot contain duplicate phase numbers",
      severity: "error",
    });
  }

  return errors;
};

// MaxLoadPerPhase validation
export const validateMaxLoadPerPhase = (
  maxLoad: any,
  availableSlots: any,
  row: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate maxLoad is positive integer
  const maxLoadNum = parseInt(maxLoad);
  if (isNaN(maxLoadNum) || maxLoadNum < 1 || !Number.isInteger(maxLoadNum)) {
    errors.push({
      row,
      column: "MaxLoadPerPhase",
      type: "invalid",
      message: "MaxLoadPerPhase must be a positive integer (≥1)",
      severity: "error",
    });
    return errors;
  }

  // Parse availableSlots to get length
  let slotsLength = 0;
  try {
    if (typeof availableSlots === "string") {
      const cleanSlots = availableSlots.replace(/[\[\]]/g, "");
      slotsLength = cleanSlots.split(",").length;
    } else if (Array.isArray(availableSlots)) {
      slotsLength = availableSlots.length;
    }
  } catch {
    // If we can't parse slots, skip this validation
    return errors;
  }

  // Check if maxLoad exceeds available slots
  if (maxLoadNum > slotsLength) {
    errors.push({
      row,
      column: "MaxLoadPerPhase",
      type: "out-of-range",
      message: `MaxLoadPerPhase (${maxLoadNum}) cannot exceed available slots (${slotsLength})`,
      severity: "error",
    });
  }

  return errors;
};

// Duration validation
export const validateDuration = (
  duration: any,
  row: number
): ValidationError | null => {
  const durationNum = parseFloat(duration);
  if (isNaN(durationNum) || durationNum < 1) {
    return {
      row,
      column: "Duration",
      type: "invalid",
      message: "Duration must be a number ≥ 1",
      severity: "error",
    };
  }
  return null;
};

// RequiredSkills validation (cross-reference with workers)
export const validateRequiredSkills = (
  requiredSkills: string | string[],
  workers: Worker[],
  row: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Empty string is valid
  if (
    requiredSkills === "" ||
    requiredSkills === null ||
    requiredSkills === undefined
  ) {
    return errors;
  }

  // Convert to array
  let skillsArray: string[];
  if (typeof requiredSkills === "string") {
    skillsArray = requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
  } else if (Array.isArray(requiredSkills)) {
    skillsArray = requiredSkills;
  } else {
    errors.push({
      row,
      column: "RequiredSkills",
      type: "invalid",
      message: "RequiredSkills must be a comma-separated string or array",
      severity: "error",
    });
    return errors;
  }

  // Collect all worker skills
  const allWorkerSkills = new Set<string>();
  workers.forEach((worker) => {
    if (worker.Skills) {
      const workerSkills =
        typeof worker.Skills === "string"
          ? worker.Skills.split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : worker.Skills;
      workerSkills.forEach((skill) => allWorkerSkills.add(skill));
    }
  });

  // Find unmatched skills
  const unmatchedSkills = skillsArray.filter(
    (skill) => !allWorkerSkills.has(skill)
  );
  if (unmatchedSkills.length > 0) {
    errors.push({
      row,
      column: "RequiredSkills",
      type: "reference",
      message: `RequiredSkills [${unmatchedSkills.join(
        ", "
      )}] not covered by any worker`,
      severity: "error",
    });
  }

  return errors;
};

// PreferredPhases validation
export const validatePreferredPhases = (
  preferredPhases: any,
  row: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Empty or null is valid
  if (!preferredPhases || preferredPhases === "") {
    return errors;
  }

  let phasesArray: number[];
  try {
    if (typeof preferredPhases === "string") {
      // Handle range syntax "1-3"
      if (preferredPhases.includes("-")) {
        const [start, end] = preferredPhases
          .split("-")
          .map((s) => parseInt(s.trim()));
        if (isNaN(start) || isNaN(end) || start > end) {
          errors.push({
            row,
            column: "PreferredPhases",
            type: "invalid",
            message: "Invalid range format in PreferredPhases",
            severity: "error",
          });
          return errors;
        }
        phasesArray = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i
        );
      } else {
        // Handle list syntax "1,3,5" or "[1,3,5]"
        const cleanPhases = preferredPhases.replace(/[\[\]]/g, "");
        phasesArray = cleanPhases.split(",").map((s) => parseInt(s.trim()));
      }
    } else if (Array.isArray(preferredPhases)) {
      phasesArray = preferredPhases.map((p) => parseInt(p));
    } else {
      errors.push({
        row,
        column: "PreferredPhases",
        type: "invalid",
        message:
          "PreferredPhases must be a range (1-3), list (1,3,5), or array",
        severity: "error",
      });
      return errors;
    }
  } catch {
    errors.push({
      row,
      column: "PreferredPhases",
      type: "format",
      message: "Invalid PreferredPhases format",
      severity: "error",
    });
    return errors;
  }

  // Validate all elements are positive integers
  const invalidPhases = phasesArray.filter(
    (p) => isNaN(p) || p < 1 || !Number.isInteger(p)
  );
  if (invalidPhases.length > 0) {
    errors.push({
      row,
      column: "PreferredPhases",
      type: "invalid",
      message: "All PreferredPhases must be positive integers",
      severity: "error",
    });
  }

  // Check for duplicates
  const uniquePhases = new Set(phasesArray);
  if (uniquePhases.size !== phasesArray.length) {
    errors.push({
      row,
      column: "PreferredPhases",
      type: "duplicate",
      message: "PreferredPhases cannot contain duplicate phase numbers",
      severity: "error",
    });
  }

  return errors;
};

// MaxConcurrent validation (cross-reference with qualified workers)
export const validateMaxConcurrent = (
  maxConcurrent: any,
  requiredSkills: string | string[],
  workers: Worker[],
  row: number
): ValidationError | null => {
  // Validate maxConcurrent is positive integer
  const maxConcurrentNum = parseInt(maxConcurrent);
  if (
    isNaN(maxConcurrentNum) ||
    maxConcurrentNum < 1 ||
    !Number.isInteger(maxConcurrentNum)
  ) {
    return {
      row,
      column: "MaxConcurrent",
      type: "invalid",
      message: "MaxConcurrent must be a positive integer (≥1)",
      severity: "error",
    };
  }

  // Convert requiredSkills to array
  let skillsArray: string[] = [];
  if (requiredSkills && requiredSkills !== "") {
    if (typeof requiredSkills === "string") {
      skillsArray = requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
    } else if (Array.isArray(requiredSkills)) {
      skillsArray = requiredSkills;
    }
  }

  // Find qualified workers (workers who have all required skills)
  const qualifiedWorkers = workers.filter((worker) => {
    if (skillsArray.length === 0) return true; // No skills required, all workers qualified

    const workerSkills = worker.Skills
      ? typeof worker.Skills === "string"
        ? worker.Skills.split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : worker.Skills
      : [];

    return skillsArray.every((skill) => workerSkills.includes(skill));
  });

  // Check if maxConcurrent exceeds qualified workers
  if (maxConcurrentNum > qualifiedWorkers.length) {
    return {
      row,
      column: "MaxConcurrent",
      type: "out-of-range",
      message: `MaxConcurrent (${maxConcurrentNum}) exceeds available qualified workers (${qualifiedWorkers.length})`,
      severity: "error",
    };
  }

  return null;
};
