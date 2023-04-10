import { Button, Col, Form, Input, Layout, message, Radio, Row, Space } from "antd"
import { useForm } from "antd/lib/form/Form"
import { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent, useCallback, useMemo, useRef, useState } from "react"
import { useEffect } from "react"
import logo from '../../images/logo.png'
import KitTrackerApiService from "../../services/KitTrackerApiService"

const KitTrackerPage: FunctionComponent<{}> = props => {
    const [stages, setStages] = useState([] as string[])
    const [stageName, setStageName] = useState(undefined as undefined | string)
    const [loading, setLoading] = useState(false)
    const [missingKitData, setMissingKitData] = useState(false)
    const serialInput = useRef() as any
    const kitInput = useRef() as any
    const weekofInput = useRef() as any

    const [form] = useForm()

    const submitStage = useCallback((values) => {
        setLoading(true)

        setStageName(values.stage)
        setMissingKitData(false)
        form.resetFields()

        setLoading(false)
    }, [form])

    const stageAcceptsKitData = useMemo(() =>
        stageName === 'Merchandising'
        || stageName === 'Packaging'
        || stageName === 'Pre-Packaging'
        || stageName === 'Shipped'
        || stageName === 'Warehouse', [stageName])
    const showKitFields = useMemo(() => stageAcceptsKitData && missingKitData, [missingKitData, stageAcceptsKitData])

    const submitKitUpdate = useCallback((values) => {
        setLoading(true)

        if (stageName) {
            KitTrackerApiService.getItem(values.serialNumber)
                .then(item => {
                    if (stageAcceptsKitData && item.kitId === null && (
                        values.kitNumber === undefined
                        || values.kitNumber.trim().length === 0
                        || values.weekOf === undefined
                        || values.weekOf.trim().length === 0
                    )) {
                        setMissingKitData(true)
                        kitInput.current.focus()
                        setLoading(false)
                    } else {
                        KitTrackerApiService.updateItem(values.serialNumber,
                            stageName,
                            item.kitId === null ? values.kitNumber : null,
                            item.weekOf === null ? values.weekOf : null)
                            .then(result => {
                                if (result) {
                                    message.success(`Successfully updated ${values.serialNumber}`)
                                    setMissingKitData(false)
                                    form.resetFields()
                                    serialInput.current.focus()
                                }
                            })
                            .catch((e: Error) => message.error(e.message))
                            .finally(() => {
                                setLoading(false)
                            })
                    }
                })
        }
    }, [stageName, stageAcceptsKitData, form])

    const weekofFocus = useCallback(() => weekofInput.current.focus(), [weekofInput])

    useEffect(() => {
        KitTrackerApiService.getStages().then(stages => setStages(stages))
    }, [])

    return stageName
        ? <Layout className="layout" style={{ height: "100vh" }}>
            <Content>
                <Row justify="center" align="middle" style={{ height: '100vh' }}>
                    <Col span={4}>
                        <div style={{ textAlign: 'center' }}>
                            <img src={logo} alt="logo" height={50}></img><br />
                            <h1 style={{ lineHeight: '50px', verticalAlign: 'middle', textAlign: 'center' }}>Kit Tracker - {stageName}</h1>
                        </div>
                        <Button type="link" onClick={() => setStageName(undefined)}>Switch Stage</Button><br /><br />
                        <Form form={form} onFinish={submitKitUpdate}>
                            <Form.Item name="serialNumber" label="Serial #">
                                <Input ref={serialInput} autoFocus></Input>
                            </Form.Item>
                            <div style={{ display: showKitFields ? 'inline' : 'none ' }}>
                                <Form.Item name="kitNumber" label="Kit #">
                                    <Input ref={kitInput} onPressEnter={weekofFocus} onKeyDown={(e) => e.keyCode === 13 ? e.preventDefault() : ''}></Input>
                                </Form.Item>
                                <Form.Item name="weekOf" label="Week Of">
                                    <Input ref={weekofInput}></Input>
                                </Form.Item>
                            </div>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                    Update
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Content>
        </Layout>
        : <Layout className="layout" style={{ height: "100vh" }}>
            <Content>
                <Row justify="center" align="middle" style={{ height: '100vh' }}>
                    <Col span={4}>
                        <div style={{ textAlign: 'center' }}>
                            <img src={logo} alt="logo" height={50}></img><br />
                            <h1 style={{ lineHeight: '50px', verticalAlign: 'middle', textAlign: 'center' }}>Kit Tracker</h1>
                        </div>
                        <Form form={form} onFinish={submitStage} initialValues={{ stage: 'Building' }}>
                            <Form.Item name="stage">
                                <Radio.Group>
                                    <Space direction="vertical">
                                        {stages.map(stage => <Radio key={stage} value={stage}>{stage}</Radio>)}
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                    Start
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Content>
        </Layout>
}

export default KitTrackerPage