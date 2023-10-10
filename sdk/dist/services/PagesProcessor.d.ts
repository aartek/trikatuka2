import { Spotify } from "./Spotify";
export declare class PagesProcessor {
    /**
     * Processes paginated data using specified processor and returns object with list of processed successfully and failed items
     * @param items
     * @param processor
     */
    static process<A>(items: A[][], processor: (items: A[]) => Promise<any>): Promise<{
        succeeded: A[];
        failed: A[];
    }>;
    /**
     * Loads all items using response's next parameter navigation
     * @param spotify
     * @param path
     * @param user
     * @param dataProvider - function which takes the response as param and should return object with items property
     * @param params
     * @param items
     */
    static recursiveLoad(spotify: Spotify, path: any, user: any, dataProvider?: (response: any) => {
        items: any;
        next?: any;
    }, params?: object, items?: object[]): Promise<any[]>;
}
