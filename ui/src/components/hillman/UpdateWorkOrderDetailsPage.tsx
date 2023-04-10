import { Button, Col, Form, Layout, message, Row, Select } from "antd"
import { useForm } from "antd/lib/form/Form"
import { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent, useCallback } from "react"
import { WorkOrder } from "../../data/HillmanEntities"
import HillmanApiService from "../../services/HillmanApiService"
import HomeLogoButton from "../HomeLogoButton"

const UpdateWorkOrderDetailsPage: FunctionComponent<{
    selectedWo: WorkOrder
    setSelectedWo: (wo: WorkOrder) => void
    methodNames: string[]
    materialSizeNames: string[]
    setLoading: (loading: boolean) => void
    loading: boolean
}> = props => {
    const [form] = useForm()

    const { selectedWo, setSelectedWo, methodNames, materialSizeNames, setLoading, loading } = props

    const submitWorkOrderDetails = useCallback((values) => {
        if (selectedWo !== undefined) {
            setLoading(true)
            HillmanApiService
                .updateWorkOrderDetails(selectedWo.workOrderId, values.methodName, values.materialSizeName)
                .then(result => {
                    if (result) {
                        setSelectedWo({
                            ...selectedWo,
                            methodName: values.methodName,
                            materialSizeName: values.materialSizeName
                        })
                        form.resetFields()
                    }
                })
                .catch((e: Error) => message.error(e.message))
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [form, selectedWo, setLoading, setSelectedWo])

    return <Layout className="layout" style={{ height: "100vh" }}>
        <Content>
            <Row justify="center" align="middle" style={{ height: '100vh' }}>
                <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                        <HomeLogoButton />
                        <h1 style={{ lineHeight: '50px', verticalAlign: 'middle', textAlign: 'center' }}>Hillman - Update Work Order Details</h1>
                        <h4 style={{ lineHeight: '25px', verticalAlign: 'top', textAlign: 'center' }}>
                            Sales #{selectedWo.workOrderId} / HWO#{selectedWo.hwoNumber} {selectedWo.rework && '(Rework)'}
                        </h4>
                    </div>
                    <Form form={form} onFinish={submitWorkOrderDetails}>
                        <Form.Item name="methodName" label="Packout Method" rules={[{ required: true, message: 'Please select a packout method' }]}>
                            <Select>
                                {methodNames.map(m =>
                                    <Select.Option key={m} value={m}>
                                        {m}
                                    </Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item name="materialSizeName" label="Packout Material Size" rules={[{ required: true, message: 'Please select a packout material size' }]}>
                            <Select>
                                {materialSizeNames.map(m =>
                                    <Select.Option key={m} value={m}>
                                        {m}
                                    </Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                Update Work Order
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Content>
    </Layout>
}

export default UpdateWorkOrderDetailsPage