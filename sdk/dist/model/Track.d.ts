export default class Track {
    readonly id: string;
    readonly name: string;
    readonly artists: string[];
    readonly album: string;
    constructor(id: string, name: string, artists: string[], album: string);
    static fromResponse(response: any): Track;
}
