import {
    Layout,
    Button,
    Row,
    Col,
    message,
    Spin,
    Affix,
    Space,
    Popconfirm
} from "antd";
import { FunctionComponent, useState, useCallback, useEffect } from "react"
import { Content } from "antd/lib/layout/layout";
import { useForm } from "antd/lib/form/Form";
import { Order, OrderItem, OrderShipToLocation } from "../../../data/PortalEntities";
import OrdersApiService from "../../../services/OrdersApiService"
import { useHistory, useParams, useLocation } from "react-router";
import moment from "moment";
import OrderDetailsEditModal from "./OrderDetailsEditModal";
import UsersApiService from "../../../services/UsersApiService";
import OrderDetails from "./OrderDetails";
import OrderShipToLocationDetails from "./OrderShipToLocationDetails";
import OrderShipToLocationEditModal from "./OrderShipToLocationEditModal";
import OrderItemEditModal from "./OrderItemEditModal";

const OrderCreatePage: FunctionComponent = (props) => {
    const [loading, setLoading] = useState(false)
    const [form] = useForm()
    const { orderId: orderIdStr } = useParams<{ orderId: string | undefined }>();

    const orderId = parseInt(orderIdStr ?? '0')

    const history = useHistory()
    const location: any = useLocation()

    const [order, setOrder] = useState<Order>({
        billToAddress_LocationName: '',
        billToAddress_Street1: '',
        billToAddress_Street2: '',
        billToAddress_City: '',
        billToAddress_State: '',
        billToAddress_Country: '',
        billToAddress_PostalCode: '',
        additionalEmailsList: '',
        companyId: UsersApiService.getUserInfoCookie()?.companyId ?? 0,
        orderComments: '',
        orderId: -1,
        orderNumber: '',
        orderShipToLocations: [],
        createdDateTime: moment(),
        lastUpdatedDateTime: moment()
    })
    const [editOrderDetailsVisible, setEditOrderDetailsVisible] = useState(false)
    const [editShipToLocationVisible, setEditShipToLocationVisible] = useState(false)
    const [editOrderItemVisible, setEditOrderItemVisible] = useState(false)
    const [editShipToIndex, setEditShipToIndex] = useState<number>()
    const [editOrderItemIndex, setEditOrderItemIndex] = useState<number>()

    useEffect(() => {
        if (orderId) {
            setLoading(true)
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
        }
    }, [form, orderId]);

    useEffect(() => {
        if (location.state) {
            const orderItemData = location.state.orderItemData
            setOrder(order => ({
                ...order,
                orderShipToLocations: order.orderShipToLocations.concat({
                    shipToAddress_ContactName: '',
                    shipToAddress_LocationName: '',
                    shipToAddress_Street1: '',
                    shipToAddress_Street2: '',
                    shipToAddress_City: '',
                    shipToAddress_State: '',
                    shipToAddress_PostalCode: '',
                    shipToAddress_Country: '',
                    shopPAK_ShipViaNbr: 2,
                    shipToHash: '',
                    shipTicketItemNotes: '',
                    orderItems: Object.keys(orderItemData)
                        .filter(key => orderItemData[key])
                        .map(key => ({
                            itemCode: key as string,
                            quantityOrdered: orderItemData[key] as number,
                            inStoreDate: undefined,
                            orderItemId: 0,
                            itemId: 0,
                            statusID: 0,
                            orderLineNumber: 0,
                            assemblyNumber: '',
                            assemblyQuantity: 0,
                            itemName: key as string,
                            trackingInfo: null,
                        } as OrderItem))
                } as OrderShipToLocation)
            }))
        }
    }, [location])

    const startEditShipToLocation = useCallback((shipToIndex?: number) => {
        setEditShipToIndex(shipToIndex)
        setEditShipToLocationVisible(true)
    }, [])

    const startEditOrderItem = useCallback((shipToIndex?: number, orderItemId?: number) => {
        setEditShipToIndex(shipToIndex)
        setEditOrderItemIndex(orderItemId)
        setEditOrderItemVisible(true)
    }, [])

    const submitOrderDetails = useCallback(() => {
        if ((order.billToAddress_Street1?.length ?? '') <= 0) {
            setEditOrderDetailsVisible(true)
            return
        }
        else {
            for (let shipToLocIdx = 0; shipToLocIdx < order.orderShipToLocations.length; shipToLocIdx++) {
                const shipToLoc = order.orderShipToLocations[shipToLocIdx]
                if ((shipToLoc.shipToAddress_Street1?.length ?? '') <= 0) {
                    startEditShipToLocation(shipToLocIdx)
                    return
                }
                else {
                    for (let orderItemIdx = 0; orderItemIdx < shipToLoc.orderItems.length; orderItemIdx++) {
                        const orderItem = shipToLoc.orderItems[orderItemIdx]
                        if (orderItem.inStoreDate === undefined) {
                            startEditOrderItem(shipToLocIdx, orderItemIdx)
                            return
                        }
                    }
                }
            }
        }

        setLoading(true)

        if (orderId) {
            OrdersApiService.updateOrder(order, orderId)
                .then(orderId => {
                    message.success('Updated order successfully.')
                    history.push(`/orders/${orderId}`)
                })
                .catch((e: Error) => message.error(e.message))
                .finally(() => setLoading(false))
        } else {
            OrdersApiService.createOrder(order)
                .then(orderId => {
                    message.success('Created order successfully.')
                    history.push(`/orders/${orderId}`)
                })
                .catch((e: Error) => message.error(e.message))
                .finally(() => setLoading(false))
        }
    }, [history, order, orderId, startEditOrderItem, startEditShipToLocation])

    const handleDeleteShipToLocation = useCallback((shipToIndex?: number) => {
        setOrder(order => ({
            ...order,
            orderShipToLocations: [...order.orderShipToLocations.filter((item, idx) => idx !== shipToIndex)]
        }))
    }, [])

    const handleDeleteOrderItem = useCallback((shipToIndex?: number, orderItemId?: number) => {
        setOrder(order => ({
            ...order,
            orderShipToLocations: [
                ...order.orderShipToLocations
                    .map((item, idx) => idx !== shipToIndex ? item : {
                        ...item,
                        orderItems: item.orderItems.filter((oi, key) => key !== orderItemId)
                    })]
        }))
    }, [])

    return (
        <Layout className="layout" style={{ height: "calc(100vh - 64px - 92px)", overflow: 'scroll' }}>
            <div style={{ margin: 'auto' }}>
                <Affix offsetTop={74}>
                    <Space>
                        <Popconfirm
                            title="All changes will be lost."
                            onConfirm={() => history.push('/orders')}>
                            <Button type="default" htmlType="submit" style={{ width: '100%' }}>
                                Cancel
                            </Button>
                        </Popconfirm>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ width: '100%' }}
                            onClick={submitOrderDetails}>
                            Save Changes
                        </Button>
                    </Space>
                </Affix>
            </div>
            <Content>
                <Spin spinning={loading}>
                    <OrderDetailsEditModal
                        order={order}
                        setOrderModel={setOrder}
                        hide={() => setEditOrderDetailsVisible(false)}
                        visible={editOrderDetailsVisible}
                    />
                    <OrderShipToLocationEditModal
                        shipToIndex={editShipToIndex}
                        order={order}
                        setOrder={setOrder}
                        hide={() => setEditShipToLocationVisible(false)}
                        visible={editShipToLocationVisible}
                    />
                    <OrderItemEditModal
                        shipToIndex={editShipToIndex}
                        order={order}
                        setOrder={setOrder}
                        hide={() => setEditOrderItemVisible(false)}
                        visible={editOrderItemVisible}
                        orderItemIndex={editOrderItemIndex}
                    />
                    <Row justify="center" align="top">
                        <Col span={20}>
                            <div style={{ padding: 20 }}>
                                <OrderDetails order={order} onEdit={() => setEditOrderDetailsVisible(true)} />
                            </div>

                            {/* Ship-To Locations Design*/}
                            {/* Render Ship-To Locations On button click*/}
                            {
                                order.orderShipToLocations.map((loc, idx) =>
                                    <div style={{ padding: 20, paddingTop: 0 }}>
                                        <OrderShipToLocationDetails
                                            shipToIndex={idx}
                                            order={order}
                                            shipToLocationDetails={loc}
                                            onEdit={startEditShipToLocation}
                                            onDelete={handleDeleteShipToLocation}
                                            onOrderItemEdit={startEditOrderItem}
                                            onOrderItemDelete={handleDeleteOrderItem}
                                        />
                                    </div>
                                )
                            }
                            <div style={{ padding: 20, paddingTop: 0 }}>
                                <OrderShipToLocationDetails
                                    shipToIndex={undefined}
                                    order={order}
                                    onEdit={startEditShipToLocation}
                                    onDelete={handleDeleteShipToLocation}
                                    onOrderItemEdit={startEditOrderItem}
                                    onOrderItemDelete={handleDeleteOrderItem}
                                    shipToLocationDetails={{
                                        shipToAddress_ContactName: '',
                                        shipToAddress_LocationName: '',
                                        shipToAddress_Street1: '',
                                        shipToAddress_Street2: '',
                                        shipToAddress_PostalCode: '',
                                        shipToAddress_City: '',
                                        shipToAddress_State: '',
                                        shipToAddress_Country: '',
                                        shipTicketItemNotes: '',
                                        shopPAK_ShipViaNbr: 3,
                                        orderItems: [],
                                        shipToHash: ''
                                    }} />
                            </div>
                            {/* <Form.Item>
                                        <Col span={22}>
                                            <Row>
                                                <Col span={4}></Col>
                                                <Col span={8}>
                                                    <Form.Item label="Item Code"
                                                        {...restField}
                                                        name={[name, 'itemCode']}
                                                        fieldKey={[fieldKey, 'itemCode']}
                                                        rules={[{ required: true, message: 'Item code required.' }]}
                                                    >
                                                        <Input autoFocus></Input>
                                                    </Form.Item>
                                                    <Form.Item label="Ship Quantity"
                                                        {...restField}
                                                        name={[name, 'shipQty']}
                                                        fieldKey={[fieldKey, 'shipQty']}
                                                    >
                                                        <Input autoFocus></Input>
                                                    </Form.Item>
                                                    <Form.Item label="Instore Date"
                                                        {...restField}
                                                        name={[name, 'inStoreDate']}
                                                        fieldKey={[fieldKey, 'inStoreDate']}
                                                    >
                                                        <DatePicker autoFocus />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Col>
                                        <Row>
                                            <Col span={5}> </Col>
                                            <Col span={5}> </Col>
                                            <Col span={11}>
                                                <Form.Item>
                                                    <Button type="primary" onClick={() => add()} block icon={<PlusOutlined />} htmlType="button" style={{ width: '100%' }} >
                                                        Add Order Item
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form.Item> */}
                        </Col>
                    </Row>
                </Spin>
            </Content>
        </Layout>
    );
};
export default OrderCreatePage;




