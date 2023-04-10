import { Layout, message, Spin, Table, Input, Affix, Button, Form, InputNumber } from "antd";
import { Content } from "antd/lib/layout/layout";
import React, { FunctionComponent, useCallback, useMemo, useState } from "react";
import { useEffect } from "react";
import { Item } from "../../../data/PortalEntities";
import InventoryApiService from "../../../services/InventoryApiService";
import ImageJWTAuth from "../../ImageJWTAuth";
import { Link } from 'react-router-dom';
import useForm from "antd/lib/form/hooks/useForm"
import { useHistory } from "react-router";

const { Search } = Input

const InventoryPage: FunctionComponent = props => {
    const [form] = useForm()
    const [inventoryItems, setInventoryItems] = useState<Item[]>()
    const [loading, setLoading] = useState(false)
    const [searchValue, setSearchValue] = useState<string>()
    const [ordering, setOrdering] = useState(false)
    const [selectedOrderItems, setSelectedOrderItems] = useState<string[]>([])

    const history = useHistory()

    useEffect(() => {
        setLoading(true)
        InventoryApiService.getInventoryItems()
            .then(inventoryItems => setInventoryItems(inventoryItems))
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [])

    const search = useCallback(e => setSearchValue(e.target.value), [])

    const columns = [
        {
            title: "Item Code", dataIndex: "itemName",
            render: (_: any, record: Item) =>
                <Link to={`inventory/${encodeURIComponent(record.itemId)}`}>
                    {record.itemName}
                </Link>
        },
        {
            title: 'Product Screenshot',
            key: 'product',
            render: (_: any, record: Item) => <ImageJWTAuth
                height={100}
                imageUrl={`/inventory/${record.itemId}/productimage`}
                thumbnailUrl={`/inventory/${record.itemId}/productimage/thumbnail`}
            />
        },
        {
            title: 'Package Screenshot',
            key: 'package',
            render: (_: any, record: Item) => <ImageJWTAuth
                height={100}
                imageUrl={`/inventory/${record.itemId}/packageimage`}
                thumbnailUrl={`/inventory/${record.itemId}/packageimage/thumbnail`}
            />
        },
        {
            title: "Description",
            key: 'description',
            render: (_: any, record: Item) => <div>
                <span>{record.itemDescription}</span>
                <br /><b>Package Weight: </b> {record.packageWeight} lbs
                <br /><b>Package Size: </b> {record.packageSize_Width}" x {record.packageSize_Length}"
                x {record.packageSize_Height}"
            </div>
        },
        {
            title: 'In-Stock',
            dataIndex: 'qtyInStock'
        },
        {
            title: 'On-Order',
            dataIndex: 'qtyOnOrder'
        },
        {
            title: 'Available',
            dataIndex: 'qtyAvailable'
        }
    ]

    const handleConfirmOrder = useCallback(() => {
        form.validateFields().then((values) => {
            history.push({
                pathname: '/orders/create',
                state: {
                    orderItemData: values
                }
            })
        })
    }, [form, history])

    const handleModifyQuantity = useCallback(() => {
        form.validateFields().then((values) => {
            setSelectedOrderItems([...Object.keys(values).filter(key => values[key]).map(key => key)])
        })
    }, [form])

    const dataSource = useMemo(() => {
        let result = inventoryItems
        if (result) {
            if (searchValue)
                result = result.filter(i => i.itemName.toLowerCase().includes(searchValue.toLowerCase())
                    || i.itemDescription.toLowerCase().includes(searchValue.toLowerCase()))
            if (ordering)
                result = result.filter(i => i.qtyAvailable > 0)
        }

        return result
    }, [inventoryItems, ordering, searchValue])

    return <Layout
        className="layout"
        style={{
            height: "calc(100vh - 64px - 92px)",
            width: "100%",
            // position: "fixed",
            left: 0,
            overflow: 'auto',
        }}
    >
        <Content style={{ padding: '0 50px', height: '100vh - 64px', marginTop: '20px' }}>
            <Spin spinning={loading}>
                {!!selectedOrderItems.length && (
                    <div style={{ margin: '10px 0' }}>
                        {`Ordered Item${selectedOrderItems.length > 1 ? 's' : ''}: ${selectedOrderItems.join(', ')}`}
                    </div>
                )}
                {inventoryItems !== undefined && <>
                    <Search placeholder="Search item code and description" onChange={search} enterButton />
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <Table
                            rowKey={record => record.itemId}
                            dataSource={dataSource}
                            columns={ordering ?
                                [
                                    ...columns,
                                    {
                                        title: "Order Qty",
                                        key: 'orderQty',
                                        render: (_: any, record: Item) => <div>
                                            {record.qtyAvailable <= 0
                                                ? null
                                                : <Form.Item
                                                    name={record.itemName}
                                                    rules={[
                                                        {
                                                            pattern: /^\d+$/,
                                                            message: "Order quantity must be a positive integer."
                                                        },
                                                        {
                                                            type: 'number',
                                                            max: record.qtyAvailable,
                                                            message: `Only ${record.qtyAvailable} available.`
                                                        }
                                                    ]}
                                                >
                                                    <InputNumber onChange={handleModifyQuantity} />
                                                </Form.Item>
                                            }
                                        </div>
                                    },
                                ]
                                : columns}
                            pagination={false}
                            scroll={{ y: 'calc(100vh - 64px - 92px - 30px - 55px - 32px)' }}
                        />
                    </Form>
                </>}
            </Spin>
        </Content>
        {!loading && (
            <Affix offsetBottom={30}>
                {!ordering ? (
                    <Button style={{ marginLeft: 50 }} type="primary" onClick={() => {
                        setOrdering(true)
                    }}>
                        Start Order From Here
                    </Button>
                ) : (
                    <>
                        <Button style={{ marginLeft: 50 }} type="default" onClick={() => {
                            setOrdering(false)
                            form.resetFields()
                            setSelectedOrderItems([])
                        }}>
                            Cancel
                        </Button>
                        <Button
                            style={{ marginLeft: 20 }}
                            type="primary"
                            onClick={() => {
                                handleConfirmOrder()
                            }}
                            disabled={!selectedOrderItems.length}
                        >
                            Confirm Order Quantites
                        </Button>
                    </>
                )}
            </Affix>
        )}
    </Layout>
}

export default InventoryPage
