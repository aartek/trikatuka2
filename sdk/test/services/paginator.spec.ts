import {paginator} from "../../src/services/paginator";

describe("Paginator", () => {
    it('should paginate 123 items into 6 pages with 20 items and one page with 3 items', async () => {

        //given
        const items_123 = Array.from(Array(123).keys()).map(key => {
            return {
                [`key-${key}`]: `value-${key}`
            }
        })

        //when
        const slices = paginator(items_123, 20)

        //then
        expect(slices.length).toBe(7)
        expect(slices[0].length).toBe(20)
        expect(slices[0][0]).toBe(items_123[0])
        expect(slices[5].length).toBe(20)
        expect(slices[6].length).toBe(3)
        expect(slices[6][0]).toBe(items_123[120])

    });

    it('should paginate 123 items into 6 pages with 20 items and one page with 3 items in transformed form', async () => {

        //given
        const items_123 = Array.from(Array(123).keys()).map(key => {
            return {
                id: `id-${key}`,
                value: `value-${key}`
            }
        })

        const mapper = (item) => {
            return item.id
        }

        //when
        const slices = paginator(items_123, 20, mapper)

        //then
        expect(slices.length).toBe(7)
        expect(slices[0].length).toBe(20)
        expect(slices[0][0]).toBe('id-0')
        expect(slices[5].length).toBe(20)
        expect(slices[6].length).toBe(3)
        expect(slices[6][0]).toBe('id-120')

    });
})

