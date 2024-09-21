import { UserType } from "./Enums";
export declare class User {
    type: UserType;
    id: string;
    data: any;
    constructor(id: string, data: any, type: UserType);
}
