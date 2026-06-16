export type FilePatch = {
  path: string;
  ops: {
    type: "replace" | "insert" | "delete";
    start: number;
    end: number;
    value?: string;
  }[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function applyPatch(file: string, ops: FilePatch["ops"]) {
  let result = file;

  for (const op of ops) {
    const start = clamp(op.start, 0, result.length);
    const end = clamp(op.end ?? start, start, result.length);

    if (op.type === "replace") {
      result = result.slice(0, start) + (op.value ?? "") + result.slice(end);
    }

    if (op.type === "insert") {
      result = result.slice(0, start) + (op.value ?? "") + result.slice(start);
    }

    if (op.type === "delete") {
      result = result.slice(0, start) + result.slice(end);
    }
  }

  return result;
}
