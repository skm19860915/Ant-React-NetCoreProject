import { Form, Input, Modal, DatePicker, Select, message } from "antd"
import useForm from "antd/lib/form/hooks/useForm"
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react"
import { Item, Order, OrderShipToLocation } from "../../../data/PortalEntities"
import InventoryApiService from "../../../services/InventoryApiService"

const { Option } = Select

const OrderItemEditModal: FunctionComponent<{
    order: Order,
    setOrder: React.Dispatch<React.SetStateAction<Order>>,
    visible: boolean
    hide: () => void
    shipToIndex: number | undefined,
    orderItemIndex: number | undefined,
}> = props => {

    const { order, setOrder, visible, hide, shipToIndex, orderItemIndex } = props

    const [itemOptions, setItemOptions] = useState([] as Item[])
    const [itemNameSearch, setItemNameSearch] = useState("")
    const [form] = useForm()

    const searchItemName = useCallback(searchValue => {
        setItemNameSearch(searchValue)
        InventoryApiService.getInventoryItems(searchValue, true)
            .then(result => setItemOptions(result))
            .catch((e: Error) => message.error(e.message))
    }, [])

    useEffect(() => {
        form.resetFields()
        searchItemName(null)
    }, [form, searchItemName, visible])

    const orderItemId = useMemo(() => {
        const orderItem = order.orderShipToLocations
            .find((_, idx) => idx === shipToIndex)
            ?.orderItems.find((_, idx) => idx === orderItemIndex)
        return orderItem?.orderItemId ?? 0
    }, [order.orderShipToLocations, orderItemIndex, shipToIndex])

    const onOk = useCallback(() => {
        form.validateFields().then(values => {
            if (orderItemIndex === undefined)
                setOrder(model => ({ // Add
                    ...model,
                    orderShipToLocations: model.orderShipToLocations.map((each: OrderShipToLocation, idx: number) => {
                        if (idx === shipToIndex) {
                            return {
                                ...each,
                                orderItems: [
                                    ...each.orderItems,
                                    {
                                        ...values
                                    }]
                            }
                        } else {
                            return each
                        }
                    })
                }))
            else {
                setOrder(model => ({ // Edit
                    ...model,
                    orderShipToLocations: model.orderShipToLocations.map((each: OrderShipToLocation, idx: number) => {
                        if (idx === shipToIndex) {
                            return {
                                ...each,
                                orderItems: [
                                    ...each.orderItems.map((oi, key) => key !== orderItemIndex
                                        ? oi
                                        : {
                                            ...values,
                                            orderItemId
                                        })
                                ]
                            }
                        } else {
                            return each
                        }
                    })
                }))
            }
            hide()
        })
    }, [form, orderItemId, setOrder, hide, shipToIndex, orderItemIndex])

    return <Modal
        title={`${orderItemIndex === undefined ? 'Create New' : 'Edit'} Order Item`}
        onOk={onOk}
        onCancel={hide}
        visible={visible}
    >
        <Form
            form={form}
            initialValues={shipToIndex === undefined || orderItemIndex === undefined ? undefined : order.orderShipToLocations?.[shipToIndex].orderItems?.[orderItemIndex]}
            layout="vertical"
        >
            <Form.Item
                label="Item Code"
                name='itemName'
                required
                rules={[
                    {
                        required: true,
                        message: "Item Code is required."
                    }
                ]}
            >
                <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    searchValue={itemNameSearch}
                    onSearch={searchItemName}
                    filterOption={(input, option) =>
                        option?.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                        optionA?.value.toLowerCase().localeCompare(optionB?.value.toLowerCase())
                    }
                >
                    {
                        itemOptions.map(i => <Option key={i.itemName} value={i.itemName}>
                            <b>{i.itemName}</b> {i.itemDescription} ({i.qtyAvailable} Available)
                        </Option>)
                    }
                </Select>
            </Form.Item>
            <Form.Item
                label="Ship Quantity"
                name='quantityOrdered'
                required
                rules={[
                    {
                        required: true,
                        message: "Ship Quantity is required."
                    },
                    {
                        pattern: /^\d+$/,
                        message: "Ship Quantity must be integer."
                    },
                ]}
            >
                <Input></Input>
            </Form.Item>
            <Form.Item
                label="Instore Date"
                name='inStoreDate'
                required
                rules={[
                    {
                        required: true,
                        message: "Instore Date is required."
                    }
                ]}
            >
                <DatePicker format="MM/DD/YYYY" />
            </Form.Item>
        </Form>
    </Modal>
}

export default OrderItemEditModal
