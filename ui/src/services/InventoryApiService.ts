import { Item } from "../data/PortalEntities"
import BaseApiService from "./BaseApiService"

export default class InventoryApiService {
    static async getInventoryItems(searchValue?: string, available?: boolean) {
        const queryParams = [] as string[]
        if (searchValue !== undefined)
            queryParams.push('searchValue=' + searchValue)
        if (available !== undefined)
            queryParams.push('available=' + available)
        return await BaseApiService.apiGet<Item[]>(`/inventory/${queryParams.length === 0 ? '' : `?${queryParams.join('&')}`}`)
    }

    // async updateWorkOrderDetails(woNumber: number, methodName: string, materialSizeName: string): Promise<boolean> {
    //     return await this.apiSendJSON(`/hillman/workorders/${woNumber}/details`, "POST", { methodName, materialSizeName }, undefined, undefined, undefined, true)
    // }

    static async getInventoryItemDetail(itemId: number) {
        return await BaseApiService.apiGet<Item>(`/inventory/${itemId}`)
    }
}