import { Layout, Button, Row, Col, message, Spin, Affix, Space, Popconfirm } from "antd";
import { FunctionComponent, useState, useCallback, useEffect } from "react"
import { Content } from "antd/lib/layout/layout";
import { useForm } from "antd/lib/form/Form";
import { Order } from "../../../data/PortalEntities";
import OrdersApiService from "../../../services/OrdersApiService"
import { useHistory, useParams, useLocation } from "react-router";
import moment from "moment";
import OrderDetailsEditModal from "./OrderDetailsEditModal";
import UsersApiService from "../../../services/UsersApiService";
import OrderDetails from "./OrderDetails";
import OrderShipToLocationDetails from "./OrderShipToLocationDetails";
import OrderShipToLocationEditModal from "./OrderShipToLocationEditModal";
import OrderItemEditModal from "./OrderItemEditModal";

const OrderEditRolloutPage: FunctionComponent = (props) => {
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
        createdDateTime: '',
        lastUpdatedDateTime: ''
    })
    const [editOrderDetailsVisible, setEditOrderDetailsVisible] = useState(false)
    const [editShipToLocationVisible, setEditShipToLocationVisible] = useState(false)
    const [editOrderItemVisible, setEditOrderItemVisible] = useState(false)
    const [editShipToIndex, setEditShipToIndex] = useState<number>()
    const [editOrderItemIndex, setEditOrderItemIndex] = useState<number>()
    const [orderFileData, setOrderFileData] = useState(null)

    useEffect(() => {
        if (orderId) {
            setLoading(true)
            OrdersApiService.getOrder(orderId)
                .then(result => {
                    setOrder({
                        ...result,
                        orderShipToLocations: result.orderShipToLocations
                            .map(item => ({ ...item, orderItems: item.orderItems.map(oi => ({ ...oi, inStoreDate: moment(oi.inStoreDate) })) }))
                    })
                })
                .catch((e: Error) => message.error(e.message))
                .finally(() => setLoading(false))
        }
    }, [form, orderId]);

    useEffect(() => {
        if (location.state) {
            const orderData = location.state.orderFileData
            setOrder(order => ({
                ...order,
                orderShipToLocations: orderData.map((item: any) => ({
                    shipToAddress_ContactName: item.ContactName,
                    shipToAddress_LocationName: item.LocationName,
                    shipToAddress_Street1: item.Street1,
                    shipToAddress_Street2: item.Street2,
                    shipToAddress_City: item.City,
                    shipToAddress_State: item.State,
                    shipToAddress_PostalCode: item.PostalCode,
                    shipToAddress_Country: item.Country,
                    shopPAK_ShipViaNbr: "",
                    orderNumber: item['Order #'],
                    orderItems: [...item.orderItems]
                }))
            }))
            setOrderFileData(location.state.orderFileData)
        }
    }, [location])

    const submitOrderDetails = useCallback(() => {
        setLoading(true)

        if (orderId) {
            OrdersApiService.updateOrder(order, orderId)
                .then(result => result && message.success('Updated order successfully.'))
                .catch((e: Error) => message.error(e.message))
                .finally(() => setLoading(false))
        } else {
            OrdersApiService.createOrder(order)
                .then(result => result && message.success('Created order successfully.'))
                .catch((e: Error) => message.error(e.message))
                .finally(() => setLoading(false))
        }
    }, [orderId, order])

    const startEditShipToLocation = useCallback((shipToIndex?: number) => {
        setEditShipToIndex(shipToIndex)
        setEditShipToLocationVisible(true)
    }, [])

    const handleDeleteShipToLocation = useCallback((shipToIndex?: number) => {
        setOrder(order => ({ ...order, orderShipToLocations: [...order.orderShipToLocations.filter((item, idx) => idx !== shipToIndex)] }))
    }, [])

    const startEditOrderItem = useCallback((shipToIndex?: number, orderItemIndex?: number) => {
        setEditShipToIndex(shipToIndex)
        setEditOrderItemIndex(orderItemIndex)
        setEditOrderItemVisible(true)
    }, [])

    const handleDeleteOrderItem = useCallback((shipToIndex?: number, orderItemId?: number) => {
        setOrder(order => ({
            ...order,
            orderShipToLocations: [
                ...order.orderShipToLocations
                    .map((item, idx) => idx !== shipToIndex ? item : { ...item, orderItems: item.orderItems.filter((oi, key) => key !== orderItemId) })]
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
                            <Button type="default" htmlType="submit" style={{ width: '100%' }} >
                                Cancel
                            </Button>
                        </Popconfirm>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ width: '100%' }}
                            onClick={submitOrderDetails}
                            disabled={!(order.billToAddress_Street1?.length > 0 && order.orderShipToLocations?.length > 0)}>
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
                    <Row justify="center" align="top" >
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
        </Layout >
    );
};
export default OrderEditRolloutPage;




