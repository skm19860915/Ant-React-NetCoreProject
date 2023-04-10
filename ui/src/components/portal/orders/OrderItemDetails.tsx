import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Popconfirm, Row, Space } from "antd";
import Card from "antd/lib/card";
import React, { FunctionComponent } from "react";
import { Order } from "../../../data/PortalEntities";

const statusItems = [
    { value: 'Error' },
    { value: 'New' },
    { value: 'Changed' },
    { value: 'Hold' },
    { value: 'Confirmed' },
    { value: 'Shipped' },
    { value: 'Cancelled' },
    { value: 'Legacy' }
]

const OrderItemDetails: FunctionComponent<{
    order: Order,
    shipToIndex: number,
    orderItemIndex: number | undefined,
    onOrderItemEdit: (shipIndex?: number, itemIndex?: number) => void,
    onOrderItemDelete: (shipIndex?: number, itemIndex?: number) => void,
    visibleOnly?: boolean,
}> = props => {

    const { shipToIndex, onOrderItemEdit, onOrderItemDelete, orderItemIndex, order, visibleOnly } = props

    if (orderItemIndex === undefined || shipToIndex === undefined)
        return <Row style={{ maxWidth: '700px', margin: 'auto' }}>
            <Space>
                <Button type="primary" onClick={() => onOrderItemEdit(shipToIndex, undefined)}><PlusOutlined /> Add New Order Item</Button>
            </Space>
        </Row>
    else
        return <Card
            style={{ maxWidth: '700px', margin: 'auto', marginTop: 10 }}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        {order.orderShipToLocations[shipToIndex].orderItems[orderItemIndex].itemName ? (
                            <span>{`${(order.orderShipToLocations[shipToIndex].orderItems[orderItemIndex].itemName)}`}</span>
                        ) : (
                            <span>{`Order Item ${orderItemIndex + 1}`}</span>
                        )}
                        {!visibleOnly && (
                            <Button style={{ marginLeft: 10 }} type="dashed" onClick={() => onOrderItemEdit(shipToIndex, orderItemIndex)}><EditOutlined /></Button>
                        )}
                    </div>
                    {!visibleOnly && (
                        <Popconfirm okText="Remove" onConfirm={() => onOrderItemDelete(shipToIndex, orderItemIndex)} title="Are you sure you want to remove this order item?">
                            <Button type="primary" danger><DeleteOutlined /></Button>
                        </Popconfirm>
                    )}
                </div>
            }
        >
            <Row>
                <Col span={24}>
                    <div>{`Item Code: ${(order.orderShipToLocations[shipToIndex].orderItems[orderItemIndex].itemName)}`}</div>
                    <div>{`Ship Quantity: ${(order.orderShipToLocations[shipToIndex].orderItems[orderItemIndex].quantityOrdered)}`}</div>
                    {visibleOnly && (
                        <div>{`Status: ${statusItems[order.orderShipToLocations[shipToIndex].orderItems[orderItemIndex].statusID].value}`}</div>
                    )}
                    <div>{`Instore Date: ${(order.orderShipToLocations[shipToIndex].orderItems[orderItemIndex].inStoreDate?.format('MM/DD/YYYY') ?? 'Please enter in-store date.')}`}</div>
                </Col>
            </Row>
        </Card>
}

export default OrderItemDetails
