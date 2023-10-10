export default class Track {
    readonly id: string;
    readonly name: string;
    readonly artists: string[];
    constructor(id: string, name: string, artists?: string[]);
    static fromResponse(response: any): Track;
}
