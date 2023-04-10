import { Layout, Upload, Input, Button, Row, Col, message, Spin } from "antd"
import { FunctionComponent, useState, useEffect } from "react"
import { Content } from "antd/lib/layout/layout"
import { UploadOutlined } from "@ant-design/icons"
import { useParams, useHistory } from "react-router"
import OrdersApiService from "../../../services/OrdersApiService"
import { Order } from "../../../data/PortalEntities"
import moment from "moment"
import OrderDetails from "./OrderDetails"
import OrderShipToLocationDetails from "./OrderShipToLocationDetails";

const OrderDetailsPage: FunctionComponent = (props) => {
    const history = useHistory()
    const [order, setOrder] = useState<Order>()
    const { orderId } = useParams<{ orderId: string }>()
    const [loading, setLoading] = useState(false)
    const [orderFileData, setOrderFileData] = useState(null)

    const orderUploadProps = {
        beforeUpload: (file: any) => {
            onCredInputFile(file)
            return false;
        },
    }

    const onCredInputFile = (file: any) => {
        let reader = new FileReader();
        const filename = file.name
        reader.onload = (e: any) => {
            if (filename.endsWith('.csv')) {
                const csv = e.target.result
                const lines = csv.split("\n");
                let orderData: any = []
                let headers = lines[0].split(",");
                for (let i = 1; i < lines.length - 1; i++) {
                    let currentLine = lines[i].split(",");

                    let obj: any = {}
                    for (let j = 0; j < 11; j++) {
                        obj[headers[j].trim()] = currentLine[j] ? currentLine[j].trim() : currentLine[j];
                    }
                    let orderItems: any = []
                    for (let j = 11; j < headers.length; j++) {
                        let val = currentLine[j] ? currentLine[j].trim() : currentLine[j];
                        if (val && val.length) {
                            orderItems = [
                                ...orderItems,
                                {
                                    itemName: headers[j].trim(),
                                    quantityOrdered: val,
                                    inStoreDate: moment(currentLine[0]),
                                    itemCode: headers[j].trim(),
                                }
                            ]
                        }
                    }
                    obj['orderItems'] = orderItems
                    orderData = [...orderData, obj]
                }
                setOrderFileData(orderData)
            }
        }
        reader.readAsText(file)
    }

    const uploadOrderFileData = () => {
        if (orderFileData) {
            history.push({
                pathname: '/orders/rollout',
                state: {
                    orderFileData: orderFileData
                }
            })
        }
    }

    useEffect(() => {
        OrdersApiService.getOrder(orderId)
            .then(result => {
                setOrder({
                    ...result,
                    orderShipToLocations: result.orderShipToLocations
                        .map(item => ({
                            ...item,
                            orderItems: item.orderItems.map(oi => ({ ...oi, inStoreDate: moment(oi.inStoreDate) }))
                        }))
                })
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [orderId])

    // const trackingInfos = useMemo(() => {
    //     const result: ShipTicketFreightInfo[] = []
    //     order?.orderItems.forEach(oi => { if (oi.trackingInfo !== null) result.push(oi.trackingInfo) })
    //     return result
    // }, [order?.orderItems])

    return (
        <Layout className="layout">
            <Spin spinning={loading}>
                <Content>
                    {order !== undefined && (
                        <>
                            <Row justify="center" align="top">
                                <Col span={16}>
                                    <div style={{ padding: 30 }}>
                                        <OrderDetails order={order} />
                                    </div>
                                    {
                                        order.orderShipToLocations.map((loc, idx) =>
                                            <div style={{ padding: 20, paddingTop: 0 }}>
                                                <OrderShipToLocationDetails
                                                    shipToIndex={idx}
                                                    order={order}
                                                    shipToLocationDetails={loc}
                                                    onEdit={() => {
                                                    }}
                                                    onDelete={() => {
                                                    }}
                                                    onOrderItemEdit={() => {
                                                    }}
                                                    onOrderItemDelete={() => {
                                                    }}
                                                    visibleOnly
                                                />
                                            </div>
                                        )
                                    }
                                    <div style={{ padding: 30, paddingTop: 0 }}>
                                        <Row>
                                            {/* <Col span={24}>
                                            {trackingInfos.length > 0 &&
                                                <Table
                                                    style={{ maxWidth: '750px', margin: 'auto' }}
                                                    rowKey={(record) => record.shipTicketFreightInfoID}
                                                    dataSource={trackingInfos}
                                                    columns={[
                                                        {
                                                            title: "Packing Slip #",
                                                            key: "shipTicketNbr",
                                                            render: (_, record) => <>{record.shipTicketNbr}</>
                                                        },
                                                        {
                                                            title: "Pro #",
                                                            key: "trackingNumber",
                                                            render: (_, record) => <>{record.trackingNumber}</>
                                                        },
                                                        {
                                                            title: "Carrier",
                                                            key: "carrier",
                                                            render: (_, record) => <>{record.carrier?.name}</>
                                                        },
                                                    ]}
                                                />
                                            }
                                        </Col> */}
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                            <Row justify="center" style={{ padding: 15 }}>
                                <Col span={16}>
                                    <Row>
                                        <Col span={10}><h1>Upload Order Files</h1></Col>
                                        <Col span={10}><h1>Upload BOL File</h1></Col>
                                    </Row>
                                    <Row>
                                        <Col span={10}>
                                            <Upload {...orderUploadProps}>
                                                <Button icon={<UploadOutlined />}>
                                                    Choose File
                                                </Button>
                                            </Upload>
                                        </Col>
                                        <Col span={10}>
                                            <Upload {...props} >
                                                <Button icon={<UploadOutlined />}>
                                                    Choose File
                                                </Button>
                                            </Upload>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={10}>
                                            <Button
                                                type="primary"
                                                htmlType="button"
                                                onClick={uploadOrderFileData}
                                                disabled={!orderFileData}
                                            >
                                                Edit
                                            </Button>
                                        </Col>
                                        <Col span={10}><h1>Carrier (optional)</h1></Col>
                                    </Row>
                                    <Row>
                                        <Col span={10}></Col>
                                        <Col span={10}> <Input type="text" autoFocus></Input> </Col>
                                    </Row>
                                    <Row>
                                        <Col span={10}></Col>
                                        <Col span={10}>
                                            <Button type="primary" htmlType="submit" style={{ width: '100%' }} disabled>
                                                Upload BOL
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row justify="start" style={{ padding: 15 }}>
                                <Col span={24}>
                                    {/* <Table
                                    rowKey={(record) => record.orderItemId}
                                    dataSource={order.orderItems || []}
                                    rowSelection={{
                                        type: 'checkbox',
                                        onSelect: (record) => {
                                        }
                                    }}
                                    columns={[
                                        {
                                            title: "Status",
                                            key: "status",
                                            render: (_, record) => {
                                                var statusMessage
                                                switch (record.statusID) {
                                                    case OrderStatusEnum.Shipped:
                                                        statusMessage = "Shipped"
                                                        break
                                                    case OrderStatusEnum["-ConfirmedNotPrinted"]:
                                                        statusMessage = "ConfirmedNotPrinted"
                                                        break
                                                    case OrderStatusEnum.Cancelled:
                                                        statusMessage = "Cancelled"
                                                        break
                                                    case OrderStatusEnum.Confirmed:
                                                        statusMessage = "Confirmed"
                                                        break
                                                    case OrderStatusEnum.Error:
                                                        statusMessage = "Error"
                                                        break
                                                    case OrderStatusEnum.Hold:
                                                        statusMessage = "Hold"
                                                        break
                                                    case OrderStatusEnum.New:
                                                        statusMessage = "New"
                                                        break
                                                    default:
                                                        statusMessage = "Legacy"
                                                        break
                                                }
                                                return (
                                                    <div style={{ width: "80px" }}>
                                                        <div style={{ width: "10px", height: '10px', background: StatusCSSColors[record.statusID.toString()], display: "-webkit-inline-box" }}></div>&nbsp
                                                        <text>{statusMessage} </text>
                                                    </div>
                                                )
                                            }
                                        },
                                        {
                                            title: "Ship-To",
                                            key: "shipToAddressLocationName",
                                            render: (_, record) => {
                                                if (record.orderLineNumber !== lastLineNum && record.shipToAddress_Street1) {
                                                    return (
                                                        <>
                                                            <text>{record.shipToAddress_ContactName != null && record.shipToAddress_ContactName !== "" ? record.shipToAddress_ContactName : ""} <br /></text>
                                                            <text>{record.shipToAddress_LocationName != null && record.shipToAddress_LocationName !== "" ? record.shipToAddress_LocationName : ""} <br /></text>
                                                            <text>{record.shipToAddress_Street1 != null && record.shipToAddress_Street1 !== "" ? record.shipToAddress_Street1 : ""} <br /></text>
                                                            <text>{record.shipToAddress_Street2 != null && record.shipToAddress_Street2 !== "" ? record.shipToAddress_Street2 : ""} <br /></text>
                                                            <text>{record.shipToAddress_City + record.shipToAddress_State + record.shipToAddress_PostalCode + record.shipToAddress_Country}<br /> </text>
                                                        </>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <text>Same Ship-To Address</text>
                                                    )
                                                }
                                            }
                                        },
                                        {
                                            title: "Packing Slip #",
                                            key: "packingSlipNumber",
                                            render: (_, record) =>
                                            (<div>
                                                {record.trackingInfo !== null
                                                    ? <>{record.trackingInfo.shipTicketNbr} (#{record.shipTicketItemLineNumber})</>
                                                    : 'Not Yet Shipped'}
                                            </div>)
                                        },
                                        {
                                            title: "Line #",
                                            key: "line",
                                            render: (_, record) => <>{record.orderLineNumber}</>
                                        },
                                        {
                                            title: "Assembly #",
                                            key: "assembly",
                                            render: (_, record) => <>{record.assemblyQuantity}</>
                                        },
                                        {
                                            title: "Item #",
                                            key: "item",
                                            render: (_, record) => <>{record.itemName}</>
                                        },
                                        {
                                            title: "Description",
                                            key: "itemdescription",
                                            render: (_, record) => <>{record.itemDescription}</>
                                        },
                                        {
                                            title: "Quantity",
                                            key: "quantity",
                                            render: (_, record) => <>{record.assemblyQuantity}</>
                                        },
                                        {
                                            title: "In-Store Date",
                                            key: "instoredate",
                                            render: (_, record) => <>{moment(record.inStoreDate).format("MM/DD/yyyy")}</>
                                        },
                                        {
                                            title: "Packing Slip Notes",
                                            key: "packingslipnotes",
                                            render: (_, record) => <>{record.shipTicketItemNotes}</>
                                        },
                                        {
                                            title: "BOL",
                                            key: "bol",
                                            render: (_, record) => <span style={{ color: 'red' }}>{record.shopPAK_ShipViaNbr === 3 ? "PGA SET UP BOL" : "NO BOL UPLOADED" ||
                                                record.shopPAK_ShipViaNbr === 2 ? "SETS UP BOL" : "NO BOL UPLOADED"
                                            }</span>
                                        },
                                        {
                                            title: "Weight",
                                            key: "packageWeight",
                                            render: (_, record) => <>{record.packageWeight}</>
                                        },
                                        {
                                            title: "Dimensions",
                                            key: "dimensions",
                                            render: (_, record) => <>{record.packageSize_Length + " X " + record.packageSize_Width + " X " + record.packageSize_Height}</>
                                        }
                                    ]}
                                /> */}
                                </Col>
                            </Row>
                        </>
                    )}
                </Content>
            </Spin>
        </Layout>
    )
}
export default OrderDetailsPage
