import { Button, Col, Layout, Row } from "antd"
import { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent } from "react"
import { Link, Redirect } from "react-router-dom"
import { UserInformation } from "../../data/PortalEntities"

const HomePage: FunctionComponent<{ userInfo: UserInformation }> = props => {

    const { userInfo } = props

    const showKits = userInfo.hasAdminAccess || (userInfo.companyId === 3 && userInfo.hasScanningAccess)
    const showHillman = userInfo.hasAdminAccess || (userInfo.companyId === 17 && userInfo.hasScanningAccess)
    const redirectInventory = userInfo.hasAdminAccess || userInfo.hasManagerAccess || userInfo.hasInventoryAccess
    const redirectOrders = userInfo.hasAdminAccess || userInfo.hasManagerAccess || userInfo.hasOrdersAccess

    return <Layout className="layout" style={{ height: "100vh" }}>
        <Content>
            <Row justify="center" align="middle" style={{ height: '100vh' }}>
                <Col span={8}>
                    <Row>
                        {(showKits || showHillman)
                            ? <>
                                {showKits &&
                                    <Col span={12}>
                                        <Link to="/kits">
                                            <Button type="default" style={{ width: "100%", height: 100, fontSize: 30 }}>Albertson</Button>
                                        </Link>
                                    </Col>}
                                {showHillman &&
                                    <Col span={12}>
                                        <Link to="/hillman">
                                            <Button type="default" style={{ width: "100%", height: 100, fontSize: 30 }}>Hillman</Button>
                                        </Link>
                                    </Col>}
                            </>
                            : redirectInventory ? <Redirect to="/inventory" />
                                : redirectOrders ? <Redirect to="/orders" />
                                    : null
                        }
                    </Row>
                </Col>
            </Row>
        </Content>
    </Layout >
}

export default HomePage