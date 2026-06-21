export function resolveCtor(mod: any) {
  if (!mod) return undefined;
  // support ESM default export or direct export
  return (mod.default ?? mod) as any;
}
