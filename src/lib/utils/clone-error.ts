export default function cloneError(error: Error) {
  if (!(error instanceof Error)) {
    throw new Error("Parameter must be an instance of Error");
  }

  const clonedError = new Error(error.message);

  // Copy non-standard properties
  Object.getOwnPropertyNames(error).forEach((key) => {
    if (key !== "message" && key !== "stack") {
      (clonedError as any)[key] = (error as any)[key];
    }
  });

  clonedError.stack = error.stack;

  return clonedError;
}
