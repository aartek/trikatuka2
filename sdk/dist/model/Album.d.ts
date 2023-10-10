export default class Album {
    readonly id: string;
    readonly name: string;
    readonly artists: string[];
    readonly trackcounts: number;
    constructor(id: string, name: string, artists: string[], trackcounts: number);
    static fromResponse(response: any): Album;
}
