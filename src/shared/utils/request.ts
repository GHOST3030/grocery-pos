/**
 * Express 5 types req.params values as `string | string[]` (to allow for
 * repeated route params). Our routes never use repeated params, so this
 * narrows to a plain string for use in service calls.
 */
export function paramStr(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : (value ?? '');
}
