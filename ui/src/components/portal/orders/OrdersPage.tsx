import { Layout, message, Spin, Table, Input, DatePicker, Button, Row, Col, Space } from "antd";
import { Content } from "antd/lib/layout/layout";
import moment from "moment";
import { FunctionComponent, useCallback, useState } from "react";
import { useEffect } from "react";
import { Order, ShipTicketFreightInfo } from "../../../data/PortalEntities";
import OrdersApiService from "../../../services/OrdersApiService";
import { Link } from "react-router-dom"
import { SearchOutlined } from '@ant-design/icons';
import { FilterDropdownProps, SortOrder } from "antd/es/table/interface";

interface FilteredInfo {
    salesnumber: string[];
    needByDate: string[];
    parts: string[];
    linestatuses: string[];
    createdDateTime: string[];
    orderNumber: string[];
    tracking: string[];
}

const statusItems = [{ value: 'Error' }, { value: 'New' },
{ value: 'Changed' }, { value: 'Hold' }, { value: 'Confirmed' },
{ value: 'Shipped' }, { value: 'Cancelled' }, { value: 'Legacy' },]

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

function getOrderNeedByDate(order: Order): { dateString: string, multiple: boolean } {
    if (order.orderShipToLocations?.length > 0 && order.orderShipToLocations[0].orderItems?.length > 0) {
        let needByDate: string | undefined = order.orderShipToLocations[0].orderItems[0].inStoreDate
        for (const shipToLocation of order.orderShipToLocations) { // Check for all same need by date
            for (const orderItem of shipToLocation.orderItems) {
                if (orderItem.inStoreDate !== needByDate) {
                    needByDate = undefined
                    break
                }
            }
        }
        return needByDate
            ? { dateString: needByDate, multiple: false }
            : {
                dateString: order.orderShipToLocations.map(stl => stl.orderItems.map(oi => oi.inStoreDate)).flat().sort()[0],
                multiple: true
            }
    } else {
        return { dateString: 'No line items', multiple: false }
    }
}

function getStatusValues(statusId: number): { name: string, cssColor: string } {
    return statusId === 0 ? { name: "Error", cssColor: "red" }
        : statusId === 1 ? { name: "New", cssColor: "khaki" }
            : statusId === 2 ? { name: "Changed", cssColor: "yellow" }
                : statusId === 3 ? { name: "Hold", cssColor: "darkorange" }
                    : statusId === 4 ? { name: "Confirmed", cssColor: "greenyellow" }
                        : statusId === 5 ? { name: "Shipped", cssColor: "darkgreen" }
                            : statusId === 6 ? { name: "Cancelled", cssColor: "red" }
                                : statusId === 7 ? { name: "Legacy", cssColor: "black" }
                                    : statusId === -2 ? { name: "Confirmed Not Printed", cssColor: "blue" }
                                        : { name: "?", cssColor: "white" }
}

function formatDate(dateString: string) {
    return moment(dateString).format('MMM DD, YYYY')
}

function formatTracking(trackingInfo: ShipTicketFreightInfo): string {
    let newTrackingNumber = trackingInfo.trackingNumber
    if (trackingInfo.carrier?.carrierId === 8) {
        const trackingNumbers = newTrackingNumber.trim().replace(';', '-').split(/[\s,/-]+/)
        newTrackingNumber = trackingNumbers.filter(t => t.length > 0).join(',')
    }

    return newTrackingNumber
}

const initFilterInfo: FilteredInfo = {
    salesnumber: [],
    needByDate: [],
    parts: [],
    linestatuses: [],
    createdDateTime: [],
    orderNumber: [],
    tracking: []
}

const OrdersPage: FunctionComponent = (props) => {

    const [orders, setOrders] = useState<Order[]>();
    const [loading, setLoading] = useState(false);
    const [filteredInfo, setFilteredInfo] = useState<FilteredInfo>(initFilterInfo)
    const [sorterInfo, setSorterInfo] = useState({
        order: '',
        columnKey: ''
    })
    const [carrierList, setCarrierList] = useState<string[]>([])

    const [clearFilterFlag, setClearFilterFlag] = useState(false)

    const { RangePicker } = DatePicker

    useEffect(() => {
        setLoading(true);

        OrdersApiService.getOrders()
            .then((orders) => {
                setOrders(orders)
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false));
    }, []);

    const updateOrder = useCallback((filteredInfo: FilteredInfo) => {
        let dateFilterOption: {
            needByStartDate?: string | undefined
            needByEndDate?: string | undefined
            orderStartDate?: string | undefined
            orderEndDate?: string | undefined
        } = {}
        if (filteredInfo.needByDate.length) {
            dateFilterOption.needByStartDate = JSON.parse(filteredInfo.needByDate[0]).start
            dateFilterOption.needByEndDate = JSON.parse(filteredInfo.needByDate[0]).end
        }
        if (filteredInfo.createdDateTime.length) {
            dateFilterOption.orderStartDate = JSON.parse(filteredInfo.createdDateTime[0]).start
            dateFilterOption.orderEndDate = JSON.parse(filteredInfo.createdDateTime[0]).end
        }

        setLoading(true)

        OrdersApiService.getOrders(dateFilterOption)
            .then((orders) => {
                setOrders(orders)
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false));
    }, [])

    useEffect(() => {
        if (clearFilterFlag) {
            updateOrder(filteredInfo)
            setClearFilterFlag(false)
        }
    }, [clearFilterFlag, filteredInfo, updateOrder])

    useEffect(() => {
        if (orders && orders.length) {
            let carriers: any = []
            orders.forEach(order => {
                order.orderShipToLocations.forEach(ship => {
                    ship.orderItems.forEach(item => {
                        if (item.trackingInfo && 'carrier' in item.trackingInfo) {
                            // @ts-ignore
                            if ('name' in item.trackingInfo?.carrier) {
                                // @ts-ignore
                                carriers = [...new Set([...carriers, item.trackingInfo.carrier.name])]
                            }
                        }
                    })
                })
            })
            setCarrierList(carriers)
        }
    }, [orders])

    const getColumnSearchProps = (dataIndex: string, kind: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
            <div style={{ padding: 8 }}>
                {kind === 'text' && (
                    <Input
                        placeholder={`Search ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                )}
                {kind === 'date' && (
                    <RangePicker
                        onChange={(dates, dateStrings) => {
                            setSelectedKeys([JSON.stringify({ start: dateStrings[0], end: dateStrings[1] })])
                        }
                        }
                        value={selectedKeys[0] ? [
                            moment(JSON.parse(selectedKeys[0] as string).start),
                            moment(JSON.parse(selectedKeys[0] as string).end),
                        ] : [null, null]}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                )}
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value: any, record: any) => {
            if (dataIndex === 'Sales Number') {
                return record.orderId.toString().padStart(10, '0').toLowerCase().includes(value.toLowerCase())
            } else if (dataIndex === 'Quantities') {
                let quantities = 0
                let itemCodes: string[] = []
                record.orderShipToLocations.forEach((loc: any) => {
                    loc.orderItems.forEach((item: any) => {
                        quantities += item.quantityOrdered
                        itemCodes = [...itemCodes, item.itemName]
                    })
                })

                return quantities === parseInt(value) || !!itemCodes.filter(item => item.toLowerCase().includes(value.toLowerCase())).length
            } else if (dataIndex === 'Customer PO') {
                return record.orderNumber && record.orderNumber.toLowerCase().includes(value.toLowerCase())
            }
            return true
        },
    });

    const handleSearch = useCallback((selectedKeys: any, confirm: any, dataIndex: string) => {
        if (dataIndex === 'Need By' || dataIndex === 'Order Date') {
            updateOrder(filteredInfo)
        }
        confirm()
    }, [filteredInfo, updateOrder])

    const handleReset = useCallback((clearFilters: any) => {
        clearFilters();
    }, [])

    const handleChange = useCallback((pagination: any, filters: any, sorter: any) => {
        setFilteredInfo(filters)
        setSorterInfo(sorter)
        updateOrder(filters)
    }, [updateOrder])

    // @ts-ignore
    return (
        <Layout
            className="layout"
            style={{
                height: "calc(100vh - 64px - 92px)",
                width: "100%",
                position: "fixed",
                left: 0,
            }}
        >
            <Content
                style={{
                    padding: "0 50px",
                    height: "calc(100vh - 64px - 92px - 72px)",
                    marginTop: '20px'
                }}
            >
                <Row gutter={[16, 8]} align="bottom">
                    <Col span={24} style={{ textAlign: "right", marginBottom: 10 }}>
                        <Button type="primary" onClick={() => {
                            setFilteredInfo(initFilterInfo)
                            setSorterInfo({
                                order: '',
                                columnKey: ''
                            })
                            setClearFilterFlag(true)
                        }}>Clear Filter</Button>
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <Spin spinning={loading}>
                            {orders !== undefined && (
                                <>
                                    <Table
                                        rowKey={(record) => record.orderId}
                                        dataSource={orders.sort((a, b) => getOrderNeedByDate(b).dateString.localeCompare(getOrderNeedByDate(a).dateString))}
                                        onChange={handleChange}
                                        columns={[
                                            {
                                                title: "Sales#",
                                                key: "salesnumber",
                                                render: (_, record: Order) => <Link
                                                    to={{ pathname: `/orders/${record.orderId}` }}>{record.orderId.toString().padStart(10, '0')}</Link>,
                                                sorter: (a, b) => parseInt(a.orderId.toString().padStart(10, '0')) - parseInt(b.orderId.toString().padStart(10, '0')),
                                                ...getColumnSearchProps('Sales Number', 'text'),
                                                sortOrder: (sorterInfo.columnKey === 'salesnumber' && sorterInfo.order) as SortOrder,
                                                filteredValue: filteredInfo ? filteredInfo.salesnumber : null
                                            },
                                            {
                                                title: "Need By",
                                                key: "needByDate",
                                                render: (_, record: Order) => {
                                                    const needBy = getOrderNeedByDate(record)
                                                    return formatDate(needBy.dateString) + (needBy.multiple ? ' (Earliest)' : '')
                                                },
                                                sorter: (a, b) => {
                                                    const needBy_a = getOrderNeedByDate(a)
                                                    const needBy_b = getOrderNeedByDate(b)
                                                    // @ts-ignore
                                                    return moment(needBy_a.dateString).format('X') - moment(needBy_b.dateString).format('X')
                                                },
                                                sortOrder: (sorterInfo.columnKey === 'needByDate' && sorterInfo.order) as SortOrder,
                                                ...getColumnSearchProps('Need By', 'date'),
                                                filteredValue: filteredInfo ? filteredInfo.needByDate : null,
                                            },
                                            {
                                                title: "Quantities",
                                                key: "parts",
                                                render: (_, record: Order) => {
                                                    const qtys = [] as { itemName: string, quantity: number }[]
                                                    if (record.orderShipToLocations)
                                                        for (const shipToLocation of record.orderShipToLocations)
                                                            for (const orderItem of shipToLocation.orderItems)
                                                                if (!qtys.some(p => p.itemName === orderItem.itemName))
                                                                    qtys.push({
                                                                        itemName: orderItem.itemName,
                                                                        quantity: orderItem.quantityOrdered
                                                                    })
                                                                else {
                                                                    const qty = qtys.find(p => p.itemName === orderItem.itemName)
                                                                    if (qty)
                                                                        qty.quantity += orderItem.quantityOrdered
                                                                }
                                                    return <>{qtys.map(q => `${q.itemName} (${q.quantity})`).sort().join(', ')}</>
                                                },
                                                ...getColumnSearchProps('Quantities', 'text'),
                                                filteredValue: filteredInfo ? filteredInfo.parts : null,
                                                sorter: (a, b) => {
                                                    let qa = 0
                                                    let qb = 0
                                                    a.orderShipToLocations.forEach(loc => {
                                                        loc.orderItems.forEach(item => {
                                                            qa += item.quantityOrdered
                                                        })
                                                    })
                                                    b.orderShipToLocations.forEach(loc => {
                                                        loc.orderItems.forEach(item => {
                                                            qb += item.quantityOrdered
                                                        })
                                                    })
                                                    return qa - qb
                                                },
                                                sortOrder: (sorterInfo.columnKey === 'parts' && sorterInfo.order) as SortOrder,
                                            },
                                            {
                                                title: 'Line Statuses',
                                                key: 'linestatuses',
                                                filters: statusItems.map(item => ({
                                                    text: item.value,
                                                    value: item.value
                                                })),
                                                onFilter: (value: any, record) => {
                                                    const statusValue = record.orderShipToLocations?.map(stl => stl.orderItems?.map(oi => {
                                                        const oisWithStatus = record.orderShipToLocations.map(stl => stl.orderItems.filter(i => i.statusID === oi.statusID)).flat()
                                                        if (oisWithStatus.findIndex(i => i.orderItemId === oi.orderItemId) !== 0) return null

                                                        const statusValues = getStatusValues(oi.statusID)
                                                        return statusValues.name
                                                    })).flat()
                                                    return !!statusValue.filter((item) => item && item.includes(value)).length
                                                },
                                                filteredValue: filteredInfo ? filteredInfo.linestatuses : null,
                                                render: (_, record: Order) => <>{
                                                    record.orderShipToLocations?.map(stl => stl.orderItems?.map(oi => {
                                                        const oisWithStatus = record.orderShipToLocations.map(stl => stl.orderItems.filter(i => i.statusID === oi.statusID)).flat()
                                                        if (oisWithStatus.findIndex(i => i.orderItemId === oi.orderItemId) !== 0) return null

                                                        const statusValues = getStatusValues(oi.statusID)
                                                        return <p key={oi.statusID}>
                                                            <span style={{
                                                                backgroundColor: statusValues.cssColor,
                                                                width: '12px',
                                                                height: '12px',
                                                                display: 'inline-block',
                                                                marginRight: '3px'
                                                            }} /> {statusValues.name}({oisWithStatus.length})
                                                        </p>
                                                    })).flat()
                                                }</>
                                            },
                                            {
                                                title: "Tracking Info",
                                                key: "tracking",
                                                filters: carrierList.map(item => ({
                                                    text: item,
                                                    value: item
                                                })),
                                                filteredValue: filteredInfo ? filteredInfo.tracking : null,
                                                onFilter: (value: any, record) => {
                                                    const carrierValues = record.orderShipToLocations?.map(stl => stl.orderItems?.map(oi => oi.trackingInfo)).flat().filter(notEmpty).map(t => {
                                                        return t.carrier?.name
                                                    })
                                                    return !!carrierValues.filter((item) => item && item.includes(value)).length
                                                },
                                                render: (_, record: Order) => <>
                                                    {record.orderShipToLocations?.map(stl => stl.orderItems?.map(oi => oi.trackingInfo)).flat().filter(notEmpty).map(t => {
                                                        const trackingNumber = formatTracking(t)
                                                        return <>
                                                            <a href={t.carrier?.trackingFormattedURL.replace('{0}', trackingNumber)}
                                                                target="_blank" rel="noreferrer">
                                                                #{t.shipTicketNbr} / {trackingNumber} ({t.carrier?.name})
                                                            </a><br />
                                                        </>
                                                    })}
                                                </>
                                            },
                                            {
                                                title: "Order Date",
                                                key: "createdDateTime",
                                                render: (_, record: Order) => <>{moment(record.createdDateTime).format('MMM DD, YYYY')}</>,
                                                sorter: (a, b) => {
                                                    // @ts-ignore
                                                    return moment(a.createdDateTime).format('X') - moment(b.createdDateTime).format('X')
                                                },
                                                ...getColumnSearchProps('Order Date', 'date'),
                                                filteredValue: filteredInfo ? filteredInfo.createdDateTime : null,
                                                sortOrder: (sorterInfo.columnKey === 'createdDateTime' && sorterInfo.order) as SortOrder,
                                            },
                                            {
                                                title: "Customer PO",
                                                dataIndex: "orderNumber",
                                                sorter: (a, b) => parseInt(a.orderNumber) - parseInt(b.orderNumber),
                                                ...getColumnSearchProps('Customer PO', 'text'),
                                                filteredValue: filteredInfo ? filteredInfo.orderNumber : null,
                                                sortOrder: (sorterInfo.columnKey === 'orderNumber' && sorterInfo.order) as SortOrder,
                                            }
                                        ]}
                                        pagination={false}
                                        scroll={{ y: "calc(100vh - 64px - 92px - 52px - 58px)" }}
                                    />
                                </>
                            )}
                        </Spin>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default OrdersPage;
