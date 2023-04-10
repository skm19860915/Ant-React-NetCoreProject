import { Form, Input, Modal, Select } from "antd"
import useForm from "antd/lib/form/hooks/useForm"
import { FunctionComponent, useCallback, useEffect } from "react"
import { OrderItem, Order, OrderShipToLocation } from "../../../data/PortalEntities"

const { Option } = Select


const OrderShipToLocationEditModal: FunctionComponent<{
    order: Order,
    setOrder: React.Dispatch<React.SetStateAction<Order>>,
    visible: boolean
    hide: () => void
    shipToIndex: number | undefined
}> = props => {

    const { order, setOrder, visible, hide, shipToIndex } = props

    const [form] = useForm()

    useEffect(() => form.resetFields(), [form, visible])

    const onOk = useCallback(() => {
        form.validateFields().then(values => {
            if (shipToIndex === undefined)
                setOrder(model => ({ // Add
                    ...model,
                    orderShipToLocations: model.orderShipToLocations.concat({
                        shipToAddress_ContactName: values.shipToAddress_ContactName,
                        shipToAddress_LocationName: values.shipToAddress_LocationName,
                        shipToAddress_Street1: values.shipToAddress_Street1,
                        shipToAddress_Street2: values.shipToAddress_Street2,
                        shipToAddress_City: values.shipToAddress_City,
                        shipToAddress_State: values.shipToAddress_State,
                        shipToAddress_PostalCode: values.shipToAddress_PostalCode,
                        shipToAddress_Country: values.shipToAddress_Country,
                        shopPAK_ShipViaNbr: values.shopPAK_ShipViaNbr,
                        orderItems: [] as OrderItem[]
                    } as OrderShipToLocation)
                }))
            else
                setOrder(model => { // Update
                    model.orderShipToLocations[shipToIndex] = {
                        ...model.orderShipToLocations[shipToIndex],
                        shipToAddress_ContactName: values.shipToAddress_ContactName,
                        shipToAddress_LocationName: values.shipToAddress_LocationName,
                        shipToAddress_Street1: values.shipToAddress_Street1,
                        shipToAddress_Street2: values.shipToAddress_Street2,
                        shipToAddress_City: values.shipToAddress_City,
                        shipToAddress_State: values.shipToAddress_State,
                        shipToAddress_PostalCode: values.shipToAddress_PostalCode,
                        shipToAddress_Country: values.shipToAddress_Country,
                        shopPAK_ShipViaNbr: values.shopPAK_ShipViaNbr
                    } as OrderShipToLocation

                    return model
                })
            hide()
        })
    }, [form, hide, setOrder, shipToIndex])

    return <Modal
        title="Edit Ship-To Location"
        onOk={onOk}
        onCancel={hide}
        visible={visible}
    >
        <Form
            form={form}
            initialValues={shipToIndex === undefined ? undefined : order.orderShipToLocations[shipToIndex]}
            layout="vertical"
        >
            <Form.Item
                label="Ship Via"
                name='shopPAK_ShipViaNbr'
                required
                rules={[{ required: true, message: "Ship Via is required." }]}
            >
                <Select>
                    <Option value={3}>Best Way</Option>
                    <Option value={2}>Customer Pick Up</Option>
                </Select>
            </Form.Item>
            <Form.Item
                label="Contact Name"
                name='shipToAddress_ContactName'
            >
                <Input autoFocus></Input>
            </Form.Item>
            <Form.Item
                label="Location Name"
                name='shipToAddress_LocationName'
            >
                <Input autoFocus></Input>
            </Form.Item>
            <Form.Item
                label="Street 1"
                name='shipToAddress_Street1'
                required
                rules={[{ required: true, message: "Street is required." }]}
            >
                <Input autoFocus></Input>
            </Form.Item>
            <Form.Item
                label="Street 2 (optional)"
                name='shipToAddress_Street2'
            >
                <Input autoFocus></Input>
            </Form.Item>
            <Form.Item
                label="City"
                name='shipToAddress_City'
                required
                rules={[{ required: true, message: "Street is required." }]}
            >
                <Input autoFocus></Input>
            </Form.Item>
            <Form.Item
                label="Zip"
                name='shipToAddress_PostalCode'
                required
                rules={[{ required: true, message: "Street is required." }]}
            >
                <Input autoFocus></Input>
            </Form.Item>
            <Form.Item
                label="State" name='shipToAddress_State'
                required
                rules={[{ required: true, message: "Street is required." }]}
            >
                <Input autoFocus></Input>
            </Form.Item>
            <Form.Item
                label="Country" name='shipToAddress_Country'
                required
                rules={[{ required: true, message: "Street is required." }]}
            >
                <Input autoFocus></Input>
            </Form.Item>
        </Form>
    </Modal>
}

export default OrderShipToLocationEditModal
