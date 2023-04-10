import UsersApiService from "./UsersApiService";

export default class BaseApiService {
    static getUrl(path: string): string {
        return 'api' + path
    }

    static authHeader() {
        // return authorization header with jwt token
        let token = sessionStorage.getItem('token');
    
        if (token !== null) {
            return 'Bearer ' + token ;
        } else {
            return null;
        }
    }

    static async fetchApi(input: RequestInfo, method: string = 'GET', body?: string): Promise<Response> {
        const headers = {} as Record<string, string>

        headers['Accept'] = 'application/json'
        headers['Authorization'] = `${this.authHeader()}`;
        if (body !== undefined) {
            headers['Content-Type'] = 'application/json'
        }

        const response = (await fetch(input, {
            method,
            headers,
            body
        }))

        if (response.status === 401) {
            UsersApiService.logout()

            document.location.href = "/"
        }

        return response
    }

    static async apiGet<T>(url: string, defaultValue?: T, errorMsg?: string): Promise<T> {
        const response = await this.fetchApi(this.getUrl(url))
        if (response.ok)
            return await response.json() as T

        if (defaultValue && !errorMsg)
            return defaultValue
        else if (defaultValue && errorMsg) {
            console.error(errorMsg)
            return defaultValue
        } else if (errorMsg)
            throw new Error(errorMsg)

        throw new Error(response.status + " Error: " + url)
    }

    static async apiSendJSON(
        url: string,
        method: string,
        body: any,
        onSuccess?: any,
        exceptionPrefix?: string,
        throwStatusCode?: boolean,
        throwStatusText?: boolean
    ): Promise<boolean> {
        if (body && {}.toString.call(body) === '[object Function]')
            throw new Error("Cannot pass function as body")

        try {
            const response = await this.fetchApi(this.getUrl(url), method, JSON.stringify(body))

            if (response.ok) {
                if (onSuccess)
                    onSuccess()

                return true
            } else if (throwStatusCode)
                throw new Error(response.status.toString())
            else if (throwStatusText)
                throw new Error(await response.json() as string)
        } catch (exception) {
            if (throwStatusCode || throwStatusText)
                throw exception
            if (exceptionPrefix)
                throw new Error(exceptionPrefix + ": " + exception)
            else
                throw new Error(url + " Exception: " + exception)
        }

        return false
    }

    static async apiSendJSONAndGet<T>(url: string, method: string, body: any, onSuccess?: any, exceptionPrefix?: string, throwStatusCode?: boolean, throwStatusText?: boolean): Promise<T> {
        if (body && {}.toString.call(body) === '[object Function]')
            throw new Error("Cannot pass function as body")

        try {
            const response = await this.fetchApi(this.getUrl(url), method, JSON.stringify(body))

            if (response.ok) {
                if (onSuccess)
                    onSuccess()

                return await response.json() as T
            } else if (throwStatusCode)
                throw new Error(response.status.toString())
            else if (throwStatusText)
                throw new Error(await response.json() as string)
        } catch (exception) {
            if (throwStatusCode || throwStatusText)
                throw exception
            if (exceptionPrefix)
                throw new Error(exceptionPrefix + ": " + exception)
            else
                throw new Error(url + " Exception: " + exception)
        }

        throw new Error("Reached an unreachable path...")
    }
}