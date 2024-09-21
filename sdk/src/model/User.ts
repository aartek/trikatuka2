import { UserType } from "./Enums";

export class User {

    type: UserType;
    id: string;
    data: any;

    constructor(id: string, data: any, type: UserType) {
        this.type = type;
        this.data = data;
        this.id = id;
    }
}

