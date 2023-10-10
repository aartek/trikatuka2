export default class Artist {
    readonly id: string;
    readonly name: string;
    constructor(id: string, name: string);
    static fromResponse(response: any): Artist;
}
