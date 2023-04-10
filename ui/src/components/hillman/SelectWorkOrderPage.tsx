import { Button, Col, Form, Layout, Row, Select } from "antd"
import { useForm } from "antd/lib/form/Form"
import { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent, useCallback } from "react"
import { WorkOrder } from "../../data/HillmanEntities"
import HomeLogoButton from "../HomeLogoButton"

const SelectWorkOrderPage: FunctionComponent<{
    workOrders: WorkOrder[]
    setSelectedWo: (wo: WorkOrder) => void
    loading: boolean
}> = props => {
    const [form] = useForm()

    const { workOrders, setSelectedWo, loading } = props

    const submitSelectedWo = useCallback((values) => {
        const selectedWorkOrder = workOrders.find(wo => wo.workOrderId === values.workOrderId)
        if (selectedWorkOrder !== undefined) {
            setSelectedWo(selectedWorkOrder)
            form.resetFields()
        }
    }, [form, setSelectedWo, workOrders])

    return <Layout className="layout" style={{ height: "100vh" }}>
        <Content>
            <Row justify="center" align="middle" style={{ height: '100vh' }}>
                <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                        <HomeLogoButton />
                        <h1 style={{ lineHeight: '50px', verticalAlign: 'middle', textAlign: 'center' }}>Hillman - Select Work Order</h1>
                    </div>
                    <Form form={form} onFinish={submitSelectedWo}>
                        <Form.Item name="workOrderId" label="Work Order #" rules={[{ required: true, message: 'Please select a work order to begin' }]}>
                            <Select>
                                {workOrders.map(wo =>
                                    <Select.Option key={wo.workOrderId} value={wo.workOrderId}>
                                        Sales #{wo.workOrderId} / HWO#{wo.hwoNumber} {wo.rework && '(Rework)'}
                                    </Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                Start Work Order
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Content>
    </Layout>
}

export default SelectWorkOrderPage