import { Item, ReportData } from "../data/AlbertsonEntities"
import BaseApiService from "./BaseApiService"

export default class KitTrackerApiService {
    static async getStages() {
        return await BaseApiService.apiGet<string[]>('/kits/stages')
    }

    static async getItem(serial: string): Promise<Item> {
        return await BaseApiService.apiGet<Item>(`/kits/${serial}`, {
            itemId: -1,
            kitId: null,
            serialNumber: "",
            stageId: 0,
            stageName: "",
            weekOf: null,
            lastUpdated: ""
        })
    }

    static async updateItem(serial: string, stageName: string, kitNumber?: string, weekOf?: string): Promise<boolean> {
        return await BaseApiService.apiSendJSON(`/kits/${serial}`, "POST", { kitNumber, stageName, weekOf }, undefined, undefined, undefined, true)
    }

    static async getReportData(): Promise<ReportData> {
        return await BaseApiService.apiGet<ReportData>('/kits/reports')
    }
}