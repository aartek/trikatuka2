/**
 * Slices list of data into pages with size = pageSize and using mapper which converts item from type A to B
 * @param data
 * @param pageSize
 * @param mapper
 *
 * @returns array of pages with items of type B
 */
export function paginator<A extends {}, B>(data: A[], pageSize: number, mapper: (item: A) => B = (item) => item as unknown as B): B[][] {
    const pagesCount = Math.ceil(data.length / pageSize);

    const pages: A[][] = [...Array.from((Array(pagesCount)).keys())]
        .map(pageNo => data.slice(pageNo * pageSize, (pageNo * pageSize) + pageSize))

    return pages.map((pageItems: A[]) => pageItems.map((item: A) => mapper(item)));

}
