import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Popconfirm, Row, Space } from "antd";
import Card from "antd/lib/card";
import React, { FunctionComponent } from "react";
import { Order, OrderShipToLocation } from "../../../data/PortalEntities";
import OrderItemDetails from "./OrderItemDetails";


const OrderShipToLocationDetails: FunctionComponent<{
    order: Order,
    shipToIndex: number | undefined,
    shipToLocationDetails: OrderShipToLocation,
    onEdit: (index?: number) => void,
    onDelete: (index?: number) => void,
    onOrderItemEdit: (shipIndex?: number, itemIndex?: number) => void,
    onOrderItemDelete: (shipIndex?: number, itemIndex?: number) => void,
    visibleOnly?: boolean,
}> = props => {
    const {
        shipToIndex,
        shipToLocationDetails,
        onEdit,
        onDelete,
        onOrderItemEdit,
        order,
        onOrderItemDelete,
        visibleOnly
    } = props

    if (shipToIndex === undefined)
        return <Row style={{ maxWidth: '700px', margin: 'auto' }}>
            <Space>
                <Button type="primary" onClick={() => onEdit(undefined)}><PlusOutlined /> Add Ship-To Location</Button>
            </Space>
        </Row>
    else
        return <Card
            style={{ maxWidth: '700px', margin: 'auto' }}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <span>{shipToLocationDetails.shipToAddress_LocationName?.length > 0 ?
                            shipToLocationDetails.shipToAddress_LocationName :
                            shipToLocationDetails.shipToAddress_Street1
                        }
                        </span>
                        {!visibleOnly && (
                            <Button style={{ marginLeft: 10 }} type="dashed"
                                onClick={() => onEdit(shipToIndex)}><EditOutlined /></Button>
                        )}
                    </div>
                    {!visibleOnly && (
                        <Popconfirm okText="Remove" onConfirm={() => onDelete(shipToIndex)} title="Are you sure you want to remove this ship-to location?">
                            <Button type="primary" danger><DeleteOutlined /></Button>
                        </Popconfirm>
                    )}
                </div>
            }
        >
            <Row>
                <Col span={12}>
                    <h1 style={{ fontSize: 20 }}>
                        Ship-To Address <i>({shipToLocationDetails.shopPAK_ShipViaNbr === 3 ? 'Best Way' : 'Custom Pickup'})</i>
                    </h1>
                    {shipToLocationDetails.orderNumber &&
                        <div>
                            {`Order #: ${shipToLocationDetails.orderNumber}`}
                        </div>}
                    {shipToLocationDetails.shipToAddress_LocationName}
                    <br />{shipToLocationDetails.shipToAddress_Street1}
                    {
                        shipToLocationDetails.shipToAddress_Street2 == null || shipToLocationDetails.shipToAddress_Street2.trim().length === 0
                            ? null
                            : <><br />{shipToLocationDetails.shipToAddress_Street2}</>
                    }
                    <br />{shipToLocationDetails.shipToAddress_City}{shipToLocationDetails.shipToAddress_City ? ',' : ''} {shipToLocationDetails.shipToAddress_State} {shipToLocationDetails.shipToAddress_PostalCode}
                    <br />{shipToLocationDetails.shipToAddress_Country}
                </Col>
                <Col span={12}>
                    <h1 style={{ fontSize: 20 }}>
                        {`Order Item${shipToIndex !== undefined && order.orderShipToLocations[shipToIndex].orderItems.length > 1 ? 's' : ''} (${shipToIndex !== undefined && order.orderShipToLocations[shipToIndex].orderItems.length})`}
                    </h1>
                    {shipToIndex !== undefined && order.orderShipToLocations[shipToIndex].orderItems.map((item, idx) => (
                        <OrderItemDetails
                            order={order}
                            shipToIndex={shipToIndex}
                            orderItemIndex={idx}
                            onOrderItemEdit={onOrderItemEdit}
                            onOrderItemDelete={onOrderItemDelete}
                            visibleOnly={visibleOnly}
                        />
                    ))}
                    {!visibleOnly && (
                        <div style={{ paddingTop: 10 }}>
                            {shipToIndex !== undefined && (
                                <OrderItemDetails
                                    order={order}
                                    shipToIndex={shipToIndex}
                                    orderItemIndex={undefined}
                                    onOrderItemEdit={onOrderItemEdit}
                                    onOrderItemDelete={onOrderItemDelete}
                                    visibleOnly={visibleOnly}
                                />
                            )}
                        </div>
                    )}
                </Col>
                {/*<Col span={12}>*/}
                {/*    {shipToLocationDetails.orderItems && shipToLocationDetails.orderItems.length > 0 &&*/}
                {/*    <>*/}
                {/*      <h1 style={{fontSize: 20}}>Pending Items</h1>*/}
                {/*        {*/}
                {/*            shipToLocationDetails.orderItems.filter(oi => oi.statusID !== 5).map(oi => <div>*/}
                {/*                {UsersApiService.getUserInfoCookie()?.hasInventoryAccess*/}
                {/*                    ? <Link to={`/inventory/${oi.itemId}`}>(x{oi.quantityOrdered}) {oi.itemName}</Link>*/}
                {/*                    : <>(x{oi.quantityOrdered}) {oi.itemName}</>*/}
                {/*                }*/}
                {/*            </div>)*/}
                {/*        }*/}
                {/*    </>*/}
                {/*    }*/}
                {/*    <br/>*/}
                {/*    {shipToLocationDetails.orderItems && shipToLocationDetails.orderItems.length > 0 &&*/}
                {/*    <>*/}
                {/*      <h1 style={{fontSize: 20}}>Shipped Items</h1>*/}
                {/*        {*/}
                {/*            shipToLocationDetails.orderItems.filter(oi => oi.statusID === 5).map(oi => <div>*/}
                {/*                {UsersApiService.getUserInfoCookie()?.hasInventoryAccess*/}
                {/*                    ? <Link to={`/inventory/${oi.itemId}`}>(x{oi.quantityOrdered}) {oi.itemName}</Link>*/}
                {/*                    : <>(x{oi.quantityOrdered}) {oi.itemName}</>*/}
                {/*                }*/}
                {/*            </div>)*/}
                {/*        }*/}
                {/*    </>*/}
                {/*    }*/}
                {/*</Col>*/}
            </Row>
        </Card>
}

export default OrderShipToLocationDetails
