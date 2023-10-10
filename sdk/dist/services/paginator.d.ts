/**
 * Slices list of data into pages with size = pageSize and using mapper which converts item from type A to B
 * @param data
 * @param pageSize
 * @param mapper
 *
 * @returns array of pages with items of type B
 */
export declare function paginator<A extends {}, B>(data: A[], pageSize: number, mapper?: (item: A) => B): B[][];
