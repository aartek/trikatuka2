/**
 * @deprecated
 * Calculates number of pages and runs mapper function for each page.
 * @param totalNumberOfItems total number of items to process
 * @param pageSize max number of items per page
 * @param mapper function run per each page
 * @returns {*[]}
 */
export default function paginator(totalNumberOfItems, pageSize, mapper) {

    const pages = Math.ceil(totalNumberOfItems / pageSize);

    return [...Array.from(Array(pages).keys())]
        .map(pageNo => mapper(pageNo))

}

/**
 * Slices list of data into pages with size = pageSize and using mapper which converts items from type A to B
 * @param data
 * @param pageSize
 * @param mapper
 *
 * @returns array of pages with items of type B
 */
export function paginator2<A extends {}, B>(data: A[], pageSize: number, mapper: (items: A[]) => B[]): B[][] {
    const pagesCount = Math.ceil(data.length / pageSize);

    const pages: A[][] = [...Array.from((Array(pagesCount)).keys())]
        .map(pageNo => data.slice(pageNo * pageSize, (pageNo * pageSize) + pageSize))

    return pages.map((page: A[]) => mapper(page));

}

export function paginator22<A extends {}, B>(data: A[], pageSize: number, mapper: (item: A) => B): B[][] {
    const pagesCount = Math.ceil(data.length / pageSize);

    const pages: A[][] = [...Array.from((Array(pagesCount)).keys())]
        .map(pageNo => data.slice(pageNo * pageSize, (pageNo * pageSize) + pageSize))

    return pages.map((pageItems: A[]) => pageItems.map((item: A) => mapper(item)));

}


// module.exports = paginator
