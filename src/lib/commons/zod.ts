import type { ZodError } from "zod";

export function getZodFieldErrors(error: ZodError) {
  return error.issues.reduce<Record<string, string[]>>((accumulator, issue) => {
    const field = issue.path.join(".");

    if (!field) {
      return accumulator;
    }

    accumulator[field] ??= [];
    accumulator[field].push(issue.message);

    return accumulator;
  }, {});
}
