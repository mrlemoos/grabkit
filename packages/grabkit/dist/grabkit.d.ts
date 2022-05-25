import Endpoint from "./Endpoint";
declare function grabkit(baseURL?: string): <Data = unknown, Error_1 = unknown, Body_1 = unknown>(endpoint: Endpoint, { body, headers }: {
    body: Body_1;
    headers: Headers | {
        [key: string]: any;
    };
}) => Promise<(number | {
    data?: Data;
    error?: Error_1;
})[]>;
export default grabkit;
