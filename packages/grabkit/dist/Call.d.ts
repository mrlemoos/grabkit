import type Endpoint from "./Endpoint";
declare class Call<Data = any, Error = any> {
    private baseURL?;
    private method;
    private url;
    constructor(endpoint: Endpoint, baseURL?: string);
    send<Body = any>({ body, headers, }: {
        body?: Body;
        headers?: Headers | {
            [key: string]: any;
        };
    }): Promise<[{
        data?: Data;
        error?: Error;
    }, number]>;
    private debugIfTest;
    private validateURI;
    private validateMethod;
}
export default Call;
