export interface Item {
    itemId: number,
    serialNumber: string,
    stageId: number,
    kitId: number | null,
    weekOf: string | null,
    lastUpdated: string
}

export interface KitCount {
    kitNumber: string,
    kitName: string,
    count: number
}

export interface StageCount {
    stageName: string,
    kitCounts: KitCount[]
}

export interface KitsByWeekCount {
    weekOf: string,
    kitNumber: string,
    kitName: string,
    stageId: number,
    stageName: string,
    count: number
}

export interface Item {
    itemId: number,
    serialNumber: string,
    stageId: number,
    stageName: string,
    kitId: number | null,
    weekOf: string | null,
}

export interface ReportData {
    stageCounts: StageCount[],
    kitsByWeekCounts: KitsByWeekCount[],
    itemsMovedToPackingToday: Item[],
    itemsMovedToShippedToday: Item[]
}