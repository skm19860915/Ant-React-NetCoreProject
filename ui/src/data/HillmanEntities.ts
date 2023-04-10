export interface WorkOrder {
    workOrderId: number
    hwoNumber: string
    itemNumber: string
    bulkPartNumber: string
    bulkPartName: string
    expectedQuantity: number
    methodName?: string | null
    materialSizeName?: string | null
    labelCSVExported: boolean
    rework: boolean
    complete: boolean
    countryOfOrigin: string
    averageLaborRate: number | null
}

export interface Pallet {
    workOrderId: number
    hwoNumber: string
    palletNumber: string
    palletStatusName: string
    shipDateString: string
    palletPO: string
    lastCrewSize: number
    stopReasonName: string
    lastQANotes: string
    asnid: string
}

export interface Case {
    caseNumber: string
    palletNumber: string
    cartonQuantity: number
}

export interface LabelDataRow {
    salesNumber: number
    hwoNumber: string
    partNumber: string
    partName: string
    quantity: number
    itemNumber: string
    labelQuantity: number
    labelCSVExported: boolean
}

export interface WorkOrderLabelExportStatus {
    workOrderId: number
    labelCSVExported: boolean
}

export interface ASNDataRow {
    hwoNumber: string
    itemNumber: string
    cartonQuantity: number
    caseNumber: string
    palletNumber: string
    pgaDateString: string
}