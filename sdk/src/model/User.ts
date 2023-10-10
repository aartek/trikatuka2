export class User {

    type: 'SOURCE_USER' | 'TARGET_USER';
    id: string;
    data: any;

    constructor(id: string, data: any, type: 'SOURCE_USER' | 'TARGET_USER') {
        this.type = type;
        this.data = data;
        this.id = id;
    }
}

