import { ExclamationCircleOutlined } from "@ant-design/icons"
import { Modal, Button, Col, Form, Input, Layout, message, Row, Select } from "antd"
import { useForm } from "antd/lib/form/Form"
import { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent, useCallback, useRef, useState } from "react"
import { WorkOrder } from "../../data/HillmanEntities"
import HillmanApiService from "../../services/HillmanApiService"
import HomeLogoButton from "../HomeLogoButton"

const CaseScanPage: FunctionComponent<{
    selectedWo: WorkOrder
    palletNumber: string
    defaultCartonQty: number
    setDefaultCartonQty: (defaultCartonQty: number) => void
    resetPalletNumber: () => void
    stopWork: () => void
    stopReasons: string[]
    setLoading: (loading: boolean) => void
    loading: boolean
}> = props => {
    const [stopWorkModalVisible, setStopWorkModalVisible] = useState(false)
    const [qaNotesRequired, setQANotesRequired] = useState(false)
    const [stopWorkWarning, setStopWorkWarning] = useState<string>()

    const caseNumberRef = useRef() as any

    const [caseForm] = useForm()
    const [stopWorkForm] = useForm()

    const { selectedWo, palletNumber, defaultCartonQty, setDefaultCartonQty, resetPalletNumber, stopWork, stopReasons, setLoading, loading } = props

    const submitCase = useCallback((values) => {
        setLoading(true)
        HillmanApiService
            .addCase(values.caseNumber, palletNumber, values.cartonQuantity)
            .then(result => {
                if (result) {
                    message.success("Case scanned successfully")
                    setDefaultCartonQty(values.cartonQuantity)
                    caseForm.resetFields()
                    setStopWorkModalVisible(false)
                    setQANotesRequired(false)
                    setStopWorkWarning(undefined)
                    caseNumberRef.current.focus()
                }
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })
    }, [caseForm, palletNumber, setDefaultCartonQty, setLoading])

    const readyPallet = useCallback(() => {
        HillmanApiService
            .readyPallet(palletNumber)
            .then(result => {
                if (result) {
                    message.success("Pallet status set to ready successfully")
                    resetPalletNumber()
                }
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })
    }, [palletNumber, resetPalletNumber, setLoading])

    const stopPallet = useCallback((stopReason, qaNotes) => {
        HillmanApiService
            .stopPallet(palletNumber, stopReason, qaNotes)
            .then(result => {
                if (result) {
                    stopWorkForm.resetFields()
                    message.success("Work status updated to stopped successfully")
                    if (stopReason === 'WorkOrderComplete' || stopReason === 'OutOfProduct')
                        stopWork()
                    else
                        resetPalletNumber()
                }
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })
    }, [palletNumber, resetPalletNumber, setLoading, stopWork, stopWorkForm])

    const confirmPallet = useCallback(() => {
        stopWorkForm.validateFields().then(values => {
            if (stopWorkWarning === undefined)
                stopPallet(values.stopReason, values.qaNotes)
            else
                Modal.confirm({
                    title: stopWorkWarning,
                    icon: <ExclamationCircleOutlined />,
                    onOk() {
                        stopPallet(values.stopReason, values.qaNotes)
                    },
                    okText: 'Yes',
                    cancelText: 'No'
                })
        })
    }, [stopPallet, stopWorkForm, stopWorkWarning])

    const stopReasonChanged = useCallback(value => {
        setQANotesRequired(value === 'QA')
        setStopWorkWarning(
            value === 'WorkOrderComplete' ? 'Are you sure all product has been packed?'
                : value === 'OutOfProduct' ? 'Are you sure? Work order will be flagged as Complete.'
                    : undefined
        )
    }, [])

    return <Layout className="layout" style={{ height: "100vh" }}>
        <Modal
            visible={stopWorkModalVisible}
            title="Stop Work"
            okText="OK"
            onCancel={() => setStopWorkModalVisible(false)}
            onOk={confirmPallet}
            okButtonProps={{ loading: loading }}
            style={{ top: 20 }}
        >
            <Form layout="vertical" form={stopWorkForm}>
                <Form.Item label="Stop Reason" name="stopReason" rules={[{ required: true, message: 'Please select a stop work reason' }]}>
                    <Select onChange={stopReasonChanged}>
                        {stopReasons.map(r =>
                            <Select.Option key={r} value={r}>
                                {r}
                            </Select.Option>
                        )}
                    </Select>
                </Form.Item>
                {qaNotesRequired &&
                    <Form.Item label="QA Notes" name="qaNotes" rules={[{ required: true, message: 'QA notes required for QA stop' }]}>
                        <Input />
                    </Form.Item>
                }
            </Form>
        </Modal>
        <Content>
            <Row justify="center" align="middle" style={{ height: '100vh' }}>
                <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                        <HomeLogoButton />
                        <h1 style={{ lineHeight: '50px', verticalAlign: 'middle', textAlign: 'center' }}>Hillman - Scan Cases</h1>
                        <h4 style={{ lineHeight: '25px', verticalAlign: 'top', textAlign: 'center' }}>
                            Sales #{selectedWo.workOrderId} / HWO#{selectedWo.hwoNumber} {selectedWo.rework && '(Rework)'}
                        </h4>
                    </div>
                    <Row>
                        <Button type="primary" onClick={readyPallet}>Pallet Ready</Button>
                    </Row>
                    <Row>
                        <Button danger type="default" onClick={() => setStopWorkModalVisible(true)}>Stop Work</Button>
                    </Row>
                    <Form form={caseForm} onFinish={submitCase} initialValues={{ cartonQuantity: defaultCartonQty }}>
                        <Form.Item name="caseNumber" label="Case #" rules={[{ required: true, message: 'Please scan a case #' }]}>
                            <Input ref={caseNumberRef} autoFocus />
                        </Form.Item>
                        <Form.Item name="cartonQuantity" label="Carton Quantity" rules={[{ required: true, message: 'Please select a carton quantity' }]}>
                            <Select>
                                {Array.from({ length: 5 }, (_, i) => i).slice(1).map(idx =>
                                    <Select.Option key={idx} value={idx}>{idx}</Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                Add Case
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Content>
    </Layout >
}

export default CaseScanPage