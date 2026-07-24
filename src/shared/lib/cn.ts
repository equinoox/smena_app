// Tiny className joiner (clsx-lite) for conditional NativeWind classes.
type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
