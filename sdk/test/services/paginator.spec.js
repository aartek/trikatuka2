import paginator, {paginator2} from "../../src/services/paginator";

describe("Paginator", () => {
    it('should paginate 123 items into 6 pages with 20 items and one page with 3 items', async () => {

        //given
        const items_123 = [...Array(123).keys()].map(key => {
            return {
                [`key-${key}`]: `value-${key}`
            }
        })

        //when
        const slices = paginator2(items_123, 20)

        //then
        expect(slices.length).toBe(7)
        expect(slices[0].length).toBe(20)
        expect(slices[5].length).toBe(20)
        expect(slices[6].length).toBe(3)

    });

    it('should paginate 123 items into 6 pages with 20 items and one page with 3 items in transformed form', async () => {

        //given
        const items_123 = [...Array(123).keys()].map(key => {
            return {
                [`key-${key}`]: `value-${key}`
            }
        })

        const mapper = (page) => {
            return {ids: page}
        }

        //when
        const slices = paginator2(items_123, 20, mapper)

        //then
        expect(slices.length).toBe(7)
        expect(slices[0].ids.length).toBe(20)
        expect(slices[5].ids.length).toBe(20)
        expect(slices[6].ids.length).toBe(3)

    });
})

