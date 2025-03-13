
/**
 * Extracts the properties from an object type `T` whose values are of type `string`.
 *
 * @template T - The object type to extract properties from.
 *
 * @example
 * ```typescript
 * type Example = {
 *   name: string;
 *   age: number;
 *   isActive: boolean;
 * };
 *
 * type StringProperties = ClassProperties<Example>; // { name: string }
 * ```
 */
export type ClassProperties<T extends object> = Pick<T, {
  [Key in keyof T]: T[Key] extends string ? Key : never;
}[keyof T]>;

/**
 * Extracts the keys from an object type `Source` whose values are of type `PickType`.
 *
 * @template Source - The object type to extract keys from.
 * @template PickType - The type of values to match against.
 *
 * @example
 * ```typescript
 * type Example = {
 *   name: string;
 *   age: number;
 *   isActive: boolean;
 * };
 *
 * type StringKeys = KeysByType<Example, string>; // "name"
 * type NumberKeys = KeysByType<Example, number>; // "age"
 * type BooleanKeys = KeysByType<Example, boolean>; // "isActive"
 * ```
 */
export type KeysByType<Source extends object, PickType> = {
  [Key in keyof Source]: Source[Key] extends PickType ? Key : never;
}[keyof Source];

/**
 * Constructs a type by picking properties from `Source` that are assignable to `PickType`.
 *
 * @template Source - The source object type from which properties will be picked.
 * @template PickType - The type that the picked properties should be assignable to.
 *
 * @example
 * ```typescript
 * type Example = {
 *   name: string;
 *   age: number;
 *   isActive: boolean;
 * };
 *
 * type StringProperties = PickByType<Example, string>; // { name: string }
 * type NumberProperties = PickByType<Example, number>; // { age: number }
 * type BooleanProperties = PickByType<Example, boolean>; // { isActive: boolean }
 * ```
 */
export type PickByType<Source extends object, PickType> =
  Pick<Source, KeysByType<Source, PickType>>;

export type HelperResponse<T> = {
  status: number;
  message: string;
  data?: T;
}