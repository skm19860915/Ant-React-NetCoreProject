import { IMediaContentStore } from "../data/PortalEntities";
import BaseApiService from "./BaseApiService";

export default class MediaContentStoresApiService {
    static async getMediaContentStores() {
        return await BaseApiService.apiGet<IMediaContentStore[]>('/mediacontents')
    }
}