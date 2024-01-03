/**
 * Make some property optional on type
 *
 * @example
 * ```typescript
 * type Post {
 * id: string;
 * name: string;
 * age: number;
 * }
 *
 * Optional<Post, 'id' | 'age'>
 * ```
 */

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
