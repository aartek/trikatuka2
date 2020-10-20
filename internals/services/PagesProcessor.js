export class PagesProcessor {

    static async process(items, processor) {
        return await items.reduce(async (accumulatorP, current, index, allItems) => {
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
}
