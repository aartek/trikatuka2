export class User {
    type;
    id;
    data;
    constructor(id, data, type) {
        this.type = type;
        this.data = data;
        this.id = id;
    }
}
