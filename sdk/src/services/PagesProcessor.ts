import {Spotify} from "./Spotify";

export class PagesProcessor {

    /**
     * Processes paginated data using specified processor and returns object with list of processed successfully and failed items
     * @param items
     * @param processor
     */
    static async process<A>(items: A[][], processor: (items: A[]) => Promise<any>): Promise<{ succeeded: A[], failed: A[] }> {
        return items.reduce(async (accumulatorP, current, index, allItems) => {
            const stats = await accumulatorP;
            try {
                const response = await processor(allItems[index])
                stats.succeeded.push(response)
            } catch (e) {
                stats.failed.push(e)
            }
            return stats;

        }, Promise.resolve({succeeded: [], failed: []}));
    }


    /**
     * Loads all items using response's next parameter navigation
     * @param spotify
     * @param path
     * @param user
     * @param dataProvider - function which takes the response as param and should return object with items property
     * @param params
     * @param items
     */
    static async recursiveLoad(spotify: Spotify, path, user, dataProvider: (response) => { items, next? } = (response => response.data), params?: object, items: object[] = []): Promise<any[]> {
        const response = await spotify.get(path, user, Object.assign({limit: 50}, params))
        const data = dataProvider(response)
        items.push(...data.items);

        if (data.next) {
            return await PagesProcessor.recursiveLoad(spotify, data.next, user,dataProvider, params, items)
        } else {
            return items;
        }
    }

}
