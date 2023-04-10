import {EditOutlined} from "@ant-design/icons";
import {Button, Col, Row} from "antd";
import Card from "antd/lib/card";
import React, {FunctionComponent} from "react";
import {Order} from "../../../data/PortalEntities";


const OrderDetails: FunctionComponent<{ order: Order, onEdit?: () => void }> = props => {

    const {order, onEdit} = props

    const needsFilledOut = order.billToAddress_Street1.length === 0

    return <Card
        style={{maxWidth: '750px', margin: 'auto'}}
        title={
            <>
                {!needsFilledOut && onEdit !== undefined &&
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Button
                    type="dashed"
                    onClick={onEdit}
                  >
                    <EditOutlined/>
                  </Button>
                </div>
                }
            </>
        }>
        {needsFilledOut && onEdit !== undefined
            ? <Button type="primary" onClick={onEdit}>Enter Order Details</Button>
            : <Row>
                <Col span={12}>
                    <h1 style={{fontSize: 20}}>Bill-To Address</h1>
                    {order.billToAddress_LocationName}
                    <br/>{order.billToAddress_Street1}
                    {
                        order.billToAddress_Street2 == null || order.billToAddress_Street2.trim().length === 0
                            ? null
                            : <><br/>{order.billToAddress_Street2}</>
                    }
                    <br/>{order.billToAddress_City}, {order.billToAddress_State} {order.billToAddress_PostalCode}
                    <br/>{order.billToAddress_Country}
                    <br/><br/><h1 style={{fontSize: 20}}>Additional Emails</h1>
                    {order.additionalEmailsList}
                </Col>
                <Col span={12}>
                    <h1 style={{fontSize: 20}}>Order Number</h1>
                    {order.orderNumber}
                    <br/><br/><h1 style={{fontSize: 20}}>Comments</h1>
                    {order.orderComments.split('\n').map((l, idx) => <div key={idx.toString()}>{l}<br/></div>)}
                </Col>
            </Row>
        }
    </Card>
}

export default OrderDetails
