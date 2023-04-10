import { Form, Input, Modal, Select, message, InputNumber } from "antd"
import useForm from "antd/lib/form/hooks/useForm"
import { FunctionComponent, useCallback, useEffect, useState } from "react"
import { WorkOrder } from "../../data/HillmanEntities"
import HillmanApiService from "../../services/HillmanApiService"

const { Option } = Select

const WorkOrderEditModal: FunctionComponent<{
    visible: boolean
    workOrder: WorkOrder
    onCancel: () => void
    onUpdated: () => void
}> = props => {

    const [form] = useForm()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        form.resetFields()
    }, [form, props])

    const onOk = useCallback(() => {
        form.validateFields().then(values => {
            setLoading(true)
            if (props.workOrder.workOrderId <= 0)
                HillmanApiService.createWorkOrder(values)
                    .then(_ => {
                        message.success('Created work order successfully.')
                        props.onUpdated()
                    })
                    .catch((e: Error) => message.error(e.message))
                    .finally(() => setLoading(false))
            else
                HillmanApiService.updateWorkOrder(values)
                    .then(_ => {
                        message.success('Updated work order successfully.')
                        props.onUpdated()
                    })
                    .catch((e: Error) => message.error(e.message))
                    .finally(() => setLoading(false))
        })
    }, [form, props])

    return <Modal
        title={`${props.workOrder.workOrderId <= 0 ? 'Create New' : 'Edit'} Work Order`}
        onOk={onOk}
        onCancel={props.onCancel}
        visible={props.visible}
        okButtonProps={{ loading: loading }}
    >
        <Form
            form={form}
            initialValues={{ ...props.workOrder, rework: props.workOrder.rework ? 'Yes' : 'No' }}
            layout="vertical"
        >
            <Form.Item name='workOrderId' hidden>
                <InputNumber />
            </Form.Item>
            <Form.Item
                label="HWO #"
                name='hwoNumber'
                required
                rules={[
                    {
                        required: true,
                        message: "Hillman Work Order # is required."
                    }
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Item #"
                name='itemNumber'
                required
                rules={[
                    {
                        required: true,
                        message: "Item # is required."
                    }
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Bulk Part #"
                name='bulkPartNumber'
                required
                rules={[
                    {
                        required: true,
                        message: "Bulk Part # is required."
                    }
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Bulk Part Name"
                name='bulkPartName'
                required
                rules={[
                    {
                        required: true,
                        message: "Bulk Part Name is required."
                    }
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Expected Quantity"
                name='expectedQuantity'
                required
                rules={[
                    {
                        required: true,
                        message: "Expected Quantity is required."
                    },
                    {
                        pattern: /^\d+$/,
                        message: "Expected Quantity must be integer."
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Country of Origin"
                name='countryOfOrigin'
                required
                rules={[
                    {
                        required: true,
                        message: "Country of Origin is required."
                    }
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Rework"
                name='rework'
                required
                rules={[
                    {
                        required: true,
                        message: "Please select Yes or No for Rework."
                    }
                ]}
            >
                <Select>
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                </Select>
            </Form.Item>
        </Form>
    </Modal>
}

export default WorkOrderEditModal
