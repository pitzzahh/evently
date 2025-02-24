export type ClassProperties<T extends object> = Pick<T, {
  [Key in keyof T]: T[Key] extends string ? Key : never;
}[keyof T]>;