/**
 * Calculates number of pages and runs mapper function for each page.
 * @param totalNumberOfItems total number of items
 * @param pageSize max number of items per page
 * @param mapper function run per each page
 * @returns {*[]}
 */
function paginator(totalNumberOfItems, pageSize, mapper) {

    const pages = Math.ceil(totalNumberOfItems / pageSize);

    return [...Array(pages).keys()]
        .map(pageNo => mapper(pageNo))

}

module.exports = paginator
