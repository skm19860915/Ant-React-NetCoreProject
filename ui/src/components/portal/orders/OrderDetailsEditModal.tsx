import { Form, Input, Modal } from "antd"
import useForm from "antd/lib/form/hooks/useForm"
import TextArea from "antd/lib/input/TextArea"
import { FunctionComponent, useCallback, useEffect } from "react"
import { Order } from "../../../data/PortalEntities"


const OrderDetailsEditModal: FunctionComponent<{
    order: Order,
    setOrderModel: React.Dispatch<React.SetStateAction<Order>>,
    visible: boolean
    hide: () => void
}> = props => {

    const [form] = useForm()
    
    useEffect(() => form.resetFields(), [form, props.visible])

    const onOk = useCallback(() => {
        form.validateFields().then(values => {
            props.setOrderModel(model => ({
                ...model,
                billToAddress_LocationName: values.billToAddress_LocationName,
                billToAddress_Street1: values.billToAddress_Street1,
                billToAddress_Street2: values.billToAddress_Street2,
                billToAddress_City: values.billToAddress_City,
                billToAddress_State: values.billToAddress_State,
                billToAddress_PostalCode: values.billToAddress_PostalCode,
                billToAddress_Country: values.billToAddress_Country,
                orderNumber: values.orderNumber,
                additionalEmailsList: values.additionalEmailsList.split(/[\s,\n\r]+/)
                    .filter((e: string) => e.length > 0)
                    .join(','),
                orderComments: values.orderComments
            }))
            props.hide()
        })
    }, [form, props])

    return <Modal
        title="Edit Order Details"
        onOk={onOk}
        onCancel={props.hide}
        visible={props.visible}
    >
        <Form
            form={form}
            initialValues={props.order}
            layout="vertical"
        >
            <Form.Item name="orderNumber" label="Customer Order #">
                <Input autoFocus ></Input>
            </Form.Item>
            <Form.Item name="additionalEmailsList" label="Additional Emails">
                <TextArea rows={4} placeholder="Add emails on separate lines or separate with commas" />
            </Form.Item>
            <Form.Item name="orderComments" label="Comments (optional)" >
                <TextArea rows={4} />
            </Form.Item>
            <br /><h1 style={{ fontSize: 20 }}>Bill-To Address</h1>
            <Form.Item name="billToAddress_LocationName" label="Location Name">
                <Input autoFocus  ></Input>
            </Form.Item>
            <Form.Item name="billToAddress_Street1" label="Street 1" required rules={[{ required: true, message: "Street is required." }]}>
                <Input autoFocus ></Input>
            </Form.Item>
            <Form.Item name="billToAddress_Street2" label="Street 2">
                <Input autoFocus ></Input>
            </Form.Item>
            <Form.Item name="billToAddress_City" label="City" required rules={[{ required: true, message: "City is required." }]}>
                <Input autoFocus ></Input>
            </Form.Item>
            <Form.Item name="billToAddress_State" label="State" required rules={[{ required: true, message: "State is required." }]}>
                <Input autoFocus ></Input>
            </Form.Item>
            <Form.Item name="billToAddress_PostalCode" label="Zip" required rules={[{ required: true, message: "Postal code is required." }]}>
                <Input autoFocus ></Input>
            </Form.Item>
            <Form.Item name="billToAddress_Country" label="Country" required rules={[{ required: true, message: "Country is required." }]}>
                <Input autoFocus ></Input>
            </Form.Item>
        </Form>
    </Modal>
}

export default OrderDetailsEditModal