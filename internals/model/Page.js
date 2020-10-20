export default class Page {

    constructor(items, action) {
        this.items = items
        this.action = action
    }

    async doAction() {
        return this.doAction(this.items);
    }
}
