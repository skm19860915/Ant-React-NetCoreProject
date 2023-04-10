import { ASNDataRow, Case, LabelDataRow, Pallet, WorkOrder, WorkOrderLabelExportStatus } from "../data/HillmanEntities"
import BaseApiService from "./BaseApiService"

export default class HillmanApiService {
    static async getWorkOrders() {
        return await BaseApiService.apiGet<WorkOrder[]>('/hillman/workorders')
    }

    static async getWorkOrder(woNumber: number) {
        return await BaseApiService.apiGet<WorkOrder>(`/hillman/workorders/${woNumber}`)
    }

    static async uploadASN(workOrders: WorkOrder[]) {
        return await BaseApiService.apiSendJSON(`/hillman/workorders/asn`, 'POST', { workOrders }, undefined, undefined, undefined, true)
    }

    static async createWorkOrder(workOrder: WorkOrder) {
        return await BaseApiService.apiSendJSON(`/hillman/workorders`, 'POST', workOrder, undefined, undefined, undefined, true)
    }

    static async updateWorkOrder(workOrder: WorkOrder) {
        return await BaseApiService.apiSendJSON(`/hillman/workorders/${workOrder.workOrderId}`, 'PUT', workOrder, undefined, undefined, undefined, true)
    }

    static async archiveWorkOrder(workOrderId: number) {
        return await BaseApiService.apiSendJSON(`/hillman/workorders/${workOrderId}`, 'DELETE', {}, undefined, undefined, undefined, true)
    }

    static async updateWorkOrderDetails(workOrderId: number, methodName: string, materialSizeName: string): Promise<boolean> {
        return await BaseApiService.apiSendJSON(`/hillman/workorders/${workOrderId}/details`, "POST", { methodName, materialSizeName }, undefined, undefined, undefined, true)
    }

    static async getPackoutMethods() {
        return await BaseApiService.apiGet<string[]>('/hillman/workorders/methods')
    }

    static async getPackoutMaterialSizes() {
        return await BaseApiService.apiGet<string[]>('/hillman/workorders/materialsizes')
    }

    static async getPalletStatuses() {
        return await BaseApiService.apiGet<string[]>('/hillman/pallets/statuses')
    }

    static async getPallets(status?: string) {
        return await BaseApiService.apiGet<Pallet[]>(`/hillman/pallets${status === undefined ? '' : '?status=' + status}`)
    }

    static async getPallet(palletNumber: string) {
        return await BaseApiService.apiGet<Pallet[]>(`/hillman/pallets/${palletNumber}`)
    }

    static async startPallet(palletNumber: string, workOrderId: number, crewSize: number): Promise<boolean> {
        return await BaseApiService.apiSendJSON(`/hillman/pallets/${palletNumber}/start`, "POST", { workOrderId, crewSize }, undefined, undefined, undefined, true)
    }

    static async getPalletStopReasons() {
        return await BaseApiService.apiGet<string[]>('/hillman/pallets/stopreasons')
    }

    static async stopPallet(palletNumber: string, stopReason: string, qaNotes: string): Promise<boolean> {
        return await BaseApiService.apiSendJSON(`/hillman/pallets/${palletNumber}/stop`, "POST", { stopReason, qaNotes }, undefined, undefined, undefined, true)
    }

    static async readyPallet(palletNumber: string): Promise<boolean> {
        return await BaseApiService.apiSendJSON(`/hillman/pallets/${palletNumber}/ready`, "POST", {}, undefined, undefined, undefined, true)
    }

    static async getCase(caseNumber: string) {
        return await BaseApiService.apiGet<Case[]>(`/hillman/cases/${caseNumber}`)
    }

    static async addCase(caseNumber: string, palletNumber: string, cartonQuantity: number): Promise<boolean> {
        return await BaseApiService.apiSendJSON(`/hillman/cases/${caseNumber}`, "POST", { palletNumber, cartonQuantity }, undefined, undefined, undefined, true)
    }

    static async getOpenOrdersLabelData() {
        return await BaseApiService.apiGet<LabelDataRow[]>('/hillman/labels')
    }

    static async updateWorkOrdersLabelExportedStatus(workOrderStatuses: WorkOrderLabelExportStatus[]): Promise<boolean> {
        return await BaseApiService.apiSendJSON(`/hillman/labels`, "POST", { workOrderStatuses }, undefined, undefined, undefined, true)
    }

    static async getASNData(palletNumbers: string[]): Promise<ASNDataRow[]> {
        return await BaseApiService.apiSendJSONAndGet<ASNDataRow[]>(`/hillman/asn/data`, "POST", { palletNumbers }, undefined, undefined, true)
    }

    static async emailASNCSV(palletNumbers: string[]): Promise<boolean> {
        return await BaseApiService.apiSendJSON(`/hillman/asn/email`, "POST", { palletNumbers }, undefined, undefined, undefined, true)
    }
}