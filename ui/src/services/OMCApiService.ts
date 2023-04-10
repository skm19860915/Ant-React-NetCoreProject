import { StoreStatus } from "../data/PortalEntities"
import BaseApiService from "./BaseApiService"

export default class OMCApiService {
    static async getStoreStatuses() {
        return await BaseApiService.apiGet<StoreStatus[]>('/omc/stores/statuses')
    }
}