export declare class User {
    type: 'SOURCE_USER' | 'TARGET_USER';
    id: string;
    data: any;
    constructor(id: string, data: any, type: 'SOURCE_USER' | 'TARGET_USER');
}
