import { Button, Col, Form, Input, Layout, message, Row } from "antd"
import { useForm } from "antd/lib/form/Form"
import { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent, useCallback, useState } from "react"
import HomeLogoButton from "./HomeLogoButton"
import UsersApiService from "../services/UsersApiService"
import { HashRouter } from "react-router-dom"

const LoginPage: FunctionComponent<{
    onLogin: () => void
}> = props => {
    const [loading, setLoading] = useState(false)

    const [form] = useForm()

    const submitLogin = useCallback((values) => {
        setLoading(true)
        UsersApiService.login(values.userName, values.password)
            .then(() => {
                props.onLogin()
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [props])

    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <HashRouter>
        <Layout className="layout" style={{ height: "100vh" }}>
            <Content>
                <Row justify="center" align="middle" style={{ height: '100vh' }}>
                    <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                            <HomeLogoButton />
                            <h1 style={{ lineHeight: '50px', verticalAlign: 'middle', textAlign: 'center' }}>Login</h1>
                        </div>
                        <Form labelCol={{ span: 5 }} form={form} onFinish={submitLogin}>
                            <Form.Item name="userName" label="User Name " rules={[{ required: true, message: 'Please enter a valid user name' }]}>
                                <Input autoFocus></Input>
                            </Form.Item>
                            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter a valid password' }]}>
                                {/* <Input.Password  autoFocus/> */}
                                <Input type="password" autoFocus></Input>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                                    Login
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Content>
        </Layout >
    </HashRouter>
}



export default LoginPage