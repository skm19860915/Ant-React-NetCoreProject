import {  message, Spin, Row, Col, Divider, Button, Card } from "antd";
import { Content } from "antd/lib/layout/layout";
import { Typography } from 'antd';
import React, { FunctionComponent, useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Item } from "../../../data/PortalEntities";
import InventoryApiService from "../../../services/InventoryApiService";
import ImageJWTAuth from "../../ImageJWTAuth";
const { Title, Text } = Typography;
const InventoryDetails: FunctionComponent = props => {
    const params = useParams<{ itemId: string }>();

    const [inventoryItem, setInventoryItem] = useState<Item>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        InventoryApiService.getInventoryItemDetail(parseInt(params.itemId))
            .then(res => setInventoryItem(res))
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [params.itemId])

    return <Spin spinning={loading}>
        {inventoryItem !== undefined &&
            <Content style={{ margin: '50px 0 0', height: '100vh - 64' }}>
                <Card title="Inventory Item Details" bordered={false} >
                    <Row justify="start">
                        <Col span={24}>
                            <Title level={3}>{inventoryItem.itemName}</Title>
                            <Title level={4} type="secondary" style={{ margin: 0 }}>{inventoryItem.itemDescription}</Title>
                        </Col>
                    </Row>
                    <Divider />
                    <Row gutter={4} justify="center" align="stretch">
                        <Col span={12}>
                            <Card bordered={false} title="Product">
                                <Row justify="start">
                                    <Col span={24}>
                                        <Row justify="center">
                                            <Col span={24} style={{ textAlign: 'center' }}>
                                                <ImageJWTAuth
                                                    height={250}
                                                    imageUrl={`/inventory/${inventoryItem.itemId}/productimage`}
                                                    thumbnailUrl={`/inventory/${inventoryItem.itemId}/productimage`}
                                                />
                                            </Col>
                                        </Row>
                                        <Row justify="center">
                                            <Col span={24}>
                                                <Divider />
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col span={8}>
                                                <Text strong>Product Footprint</Text>
                                            </Col>
                                            <Col span={16}>
                                                {inventoryItem.itemSize_Width}"w x {inventoryItem.itemSize_Depth}"d x {inventoryItem.itemSize_Height}"h
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col span={8}>
                                                <Text strong>Facings</Text>
                                            </Col>
                                            <Col span={16}>
                                                {inventoryItem.numberOfFacings}
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col span={8}>
                                                <Text strong>Has Storage Areas</Text>
                                            </Col>
                                            <Col span={16}>
                                                {inventoryItem.hasStorageAreas ? "Yes" : "No"}
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col span={8}>
                                                <Text strong>Quantity In-Stock</Text>
                                            </Col>
                                            <Col span={16}>
                                                {inventoryItem.qtyInStock}
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col span={8}>
                                                <Text strong>Quantity On-Order</Text>
                                            </Col>
                                            <Col span={16}>
                                                {inventoryItem.qtyOnOrder}
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col span={8}>
                                                <Text strong>Quantity Available</Text>
                                            </Col>
                                            <Col span={16}>
                                                {inventoryItem.qtyAvailable}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card bordered={false} title="Package">
                                <Row justify="start">
                                    <Col span={24}>
                                        <Row justify="center">
                                            <Col span={24} style={{ textAlign: 'center' }}>
                                                <ImageJWTAuth
                                                    height={250}
                                                    imageUrl={`/inventory/${inventoryItem.itemId}/packageimage`}
                                                    thumbnailUrl={`/inventory/${inventoryItem.itemId}/packageimage`}
                                                />
                                            </Col>
                                        </Row>
                                        <Row justify="center">
                                            <Col span={24}>
                                                <Divider />
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col span={8}>
                                                <Text strong>Package Weight</Text>
                                            </Col>
                                            <Col span={16}>
                                                {`${inventoryItem.packageWeight} lbs`}
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col span={8}>
                                                <Text strong>Package Dimensions</Text>
                                            </Col>
                                            <Col span={16}>
                                                {inventoryItem.packageSize_Width}"w x {inventoryItem.packageSize_Length}"d x {inventoryItem.packageSize_Height}"h
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    <Divider />
                    <Row justify="start">
                        <Col span={24}>
                            <Button type="primary" size="large">
                                Upload Files
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </Content>
        }
    </Spin>
}

export default InventoryDetails