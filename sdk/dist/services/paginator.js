/**
 * Slices list of data into pages with size = pageSize and using mapper which converts item from type A to B
 * @param data
 * @param pageSize
 * @param mapper
 *
 * @returns array of pages with items of type B
 */
export function paginator(data, pageSize, mapper = (item) => item) {
    const pagesCount = Math.ceil(data.length / pageSize);
    const pages = [...Array.from((Array(pagesCount)).keys())]
        .map(pageNo => data.slice(pageNo * pageSize, (pageNo * pageSize) + pageSize));
    return pages.map((pageItems) => pageItems.map((item) => mapper(item)));
}
