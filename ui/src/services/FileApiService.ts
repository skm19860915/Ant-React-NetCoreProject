
import BaseApiService from "./BaseApiService"

export default class FileApiService {

    static async getBlobUrl(imageUrl: string): Promise<string> {
        const response = await BaseApiService.fetchApi(BaseApiService.getUrl(imageUrl))
        if (response.ok) {
            const blob = await response.blob()
            return URL.createObjectURL(blob);
        }

        throw new Error()
    }

}