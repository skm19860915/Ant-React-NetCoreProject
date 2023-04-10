export interface UserInformation {
    username: string
    companyId: number
    hasAdminAccess: boolean
    hasManagerAccess: boolean
    hasOperationsAccess: boolean
    hasMediaContentAccess: boolean
    hasInventoryAccess: boolean
    hasOrdersAccess: boolean
    hasDesignRequestsAccess: boolean
    hasShippingAccess: boolean
    hasScanningAccess: boolean
}

export interface Item {
    itemId: number
    itemName: string
    itemDescription: string
    projectPAK_JobItemID: number
    createdDateTime: string
    lastUpdatedDateTime: string
    itemSize_Width: number
    itemSize_Depth: number
    itemSize_Height: number
    itemSize_UOMID: number
    numberOfFacings: number
    hasStorageAreas: boolean
    packageWeight: number
    packageWeight_UOMID: number
    packageSize_Width: number
    packageSize_Length: number
    packageSize_Height: number
    packageSize_UOMID: number
    shopPAK_InvNbr: number
    productImage_FileExtension: string
    packageImage_FileExtension: string
    shopPAK_ShipTicketItemNotes: string
    freightClass: number
    setQuantity: number | null
    isActive: boolean
    packageWeight_Decimal: number | null
    hardwareKitBoxCount: number
    hardwareKitsPerUnitCount: number
    qtyInStock: number
    qtyOnOrder: number
    qtyAvailable: number
}

export type OrderStatuses = 'Any'
    | 'ConfirmedNotPrinted'
    | 'Error'
    | 'New'
    | 'Changed'
    | 'Hold'
    | 'Confirmed'
    | 'Shipped'
    | 'Cancelled'
    | 'Legacy'

export const StatusCSSColors: any = {
    '-2': 'blue',
    '0': 'red',
    '1': 'khaki',
    '2': 'yellow',
    '3': 'darkorange',
    '4': 'greenyellow',
    '5': 'darkgreen',
    '6': 'red',
    '7': 'black',


}
export enum OrderStatusEnum {
    '-ConfirmedNotPrinted' = -2,
    'Error' = 0,
    'New' = 1,
    'Changed' = 2,
    'Hold' = 3,
    'Confirmed' = 4,
    'Shipped' = 5,
    'Cancelled' = 6,
    'Legacy' = 7

}
export interface Carrier {
    carrierId: number
    name: string
    trackingFormattedURL: string
}

export interface ShipTicketFreightInfo {
    shipTicketFreightInfoID: number
    shipTicketNbr: number
    trackingNumber: string
    amountDue: number | null
    carrier: Carrier | null
}

export interface Order {
    orderId: number
    companyId: number
    createdDateTime: any
    lastUpdatedDateTime: any
    billToAddress_LocationName: string
    billToAddress_Street1: string
    billToAddress_Street2: string
    billToAddress_City: string
    billToAddress_State: string
    billToAddress_PostalCode: string
    billToAddress_Country: string
    orderNumber: string
    additionalEmailsList: string
    orderComments: string
    orderShipToLocations: OrderShipToLocation[]
}

export interface OrderShipToLocation {
    shipToAddress_ContactName: string
    shipToAddress_LocationName: string
    shipToAddress_Street1: string
    shipToAddress_Street2: string
    shipToAddress_City: string
    shipToAddress_State: string
    shipToAddress_PostalCode: string
    shipToAddress_Country: string
    shopPAK_ShipViaNbr: number
    shipToHash: string
    shipTicketItemNotes: string
    orderItems: OrderItem[],
    orderNumber?: string,
}

export interface OrderItem {
    orderItemId: number
    statusID: number
    itemName: string
    quantityOrdered: number
    inStoreDate: any
    trackingInfo: ShipTicketFreightInfo | null
}

export interface IMediaContentStore {
    city: string
    country: string
    mediaContentDisplayType: IMediaContentDisplayType
    mediaContentRegion: IMediaContentRegion
    mediaContentStoreID: number
    players: IMediaContentPlayer[]
    postalCode: string
    state: string
    storeName: string
    storeNumber: number
    street1: string
    retailer: string
    ledColor: string
}

export interface IMediaContentDisplayType {
    displayName: string
    mediaContentDisplayTypeID: number
    mediaContentRetailer: IMediaContentRetailer
    rgbw: boolean
}

export interface IMediaContentRetailer{
    mediaContentRetailerID: number
    retailerName: string
}

export interface IMediaContentRegion {
    companyID: number
    mediaContentRegionID: number
    regionName: string
}

export interface IMediaContentPlayer {
    displayLocationIndex: number
    lastPowerCycle: string
    lastResponse: string
    mediaContentPlayerID: number
    powerOn: boolean
    screenshotRequest: boolean
    updatingContent: boolean
    updatingSoftware: boolean
    uploadedFile: IUploadedFile
}

export interface IUploadedFile {
    fileName: string
    uploadedFileID: number
}

export interface IMediaRegionKey {
    key: string;
    region: string;
}

export interface IMediaDisplayTypeKey {
    key: string;
    displayType: string;
}

export interface StoreStatus{
    mediaContentStoreId: number
    retailerName: string
    regionName: string
    storeNumber: number
    displayName: string
    storeName: string
    street1: string
    street2: string
    city: string
    state: string
    zipCode: string
    ledColor: any
    playerStatuses: any
}