import { Button, Col, Form, Input, Layout, message, Row, Select } from "antd"
import { useForm } from "antd/lib/form/Form"
import { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent, useCallback } from "react"
import { WorkOrder } from "../../data/HillmanEntities"
import HillmanApiService from "../../services/HillmanApiService"
import HomeLogoButton from "../HomeLogoButton"

const StartPalletPage: FunctionComponent<{
    selectedWo: WorkOrder
    loading: boolean
    setLoading: (loading: boolean) => void
    setSelectedPalletNumber: (palletNumber: string) => void
    defaultCrewSize: number
    setDefaultCrewSize: (crewSize: number) => void
}> = props => {
    const [form] = useForm()

    const { selectedWo, setLoading, loading, setSelectedPalletNumber, defaultCrewSize, setDefaultCrewSize } = props

    const submitStartPallet = useCallback((values) => {
        HillmanApiService
            .startPallet(values.palletNumber, selectedWo.workOrderId, values.crewSize)
            .then(result => {
                if (result) {
                    setSelectedPalletNumber(values.palletNumber)
                    setDefaultCrewSize(values.crewSize)
                    form.resetFields()
                }
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })
    }, [form, selectedWo.workOrderId, setDefaultCrewSize, setLoading, setSelectedPalletNumber])

    return <Layout className="layout" style={{ height: "100vh" }}>
        <Content>
            <Row justify="center" align="middle" style={{ height: '100vh' }}>
                <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                        <HomeLogoButton />
                        <h1 style={{ lineHeight: '50px', verticalAlign: 'middle', textAlign: 'center' }}>Hillman - Scan Pallet</h1>
                        <h4 style={{ lineHeight: '25px', verticalAlign: 'top', textAlign: 'center' }}>
                            Sales #{selectedWo.workOrderId} / HWO#{selectedWo.hwoNumber} {selectedWo.rework && '(Rework)'}
                        </h4>
                    </div>
                    <Form form={form} onFinish={submitStartPallet} initialValues={{ crewSize: defaultCrewSize }}>
                        <Form.Item name="palletNumber" label="Pallet #" rules={[{ required: true, message: 'Please scan valid pallet #' }]}>
                            <Input autoFocus></Input>
                        </Form.Item>
                        <Form.Item name="crewSize" label="Crew Size" rules={[{ required: true, message: 'Please select a crew size' }]}>
                            <Select>
                                {Array.from({ length: 21 }, (_, i) => i).slice(1).map(idx =>
                                    <Select.Option key={idx} value={idx}>{idx}</Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                Start Pallet
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Content>
    </Layout>
}

export default StartPalletPage