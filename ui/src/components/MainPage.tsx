import { Button, Dropdown, Layout, Menu } from "antd"
import { Content, Header } from "antd/lib/layout/layout"
import React, { FunctionComponent, useMemo } from "react"
import { HashRouter, Redirect, Route, Switch } from "react-router-dom"
import HillmanPage from "./hillman/HillmanPage"
import HillmanReportsPage from "./hillman/HillmanReportsPage"
import HomePage from "./hillman/HomePage"
import KitTrackerPage from "./kits/KitTrackerPage"
import KitTrackerReportsPage from "./kits/KitTrackerReportsPage"
import MainFooter from "./MainFooter"
import InventoryDetails from "./portal/inventory/InventoryDetails"
import InventoryPage from "./portal/inventory/InventoryPage"
import OrderCreatePage from "./portal/orders/OrderCreatePage"
import OrderDetailsPage from "./portal/orders/OrderDetailsPage"
import OrdersPage from "./portal/orders/OrdersPage"
import { Link } from "react-router-dom"
import logo from '../images/logo_light.png'
import UsersApiService from "../services/UsersApiService"
import { DownOutlined } from "@ant-design/icons"
import { UserInformation } from "../data/PortalEntities"
import OrderEditRolloutPage from "./portal/orders/OrderEditRolloutPage";
import MediaContentPage from "./portal/mediaContent/MediaContentPage";

const MainPage: FunctionComponent<{ userInfo: UserInformation }> = props => {

    const ProfileMenu = useMemo(() => {
        return <Menu>
            <Menu.Item onClick={UsersApiService.logout}>
                <Button type="link">Logout</Button>
            </Menu.Item>
        </Menu>
    }, [])

    const { userInfo } = props

    return <HashRouter>
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ position: 'fixed', zIndex: 2, width: '100%' }}>
                <div className="logo">
                    <img src={logo} alt="logo" height={50} />
                </div>
                <div className="menu-right">
                    <Dropdown overlay={ProfileMenu} trigger={['click']}>
                        <Button type="link" className="profile-link menu-right-item">
                            {`Signed in as ${userInfo.username}`} <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} style={{ paddingLeft: '20px' }}>
                    {(userInfo.hasInventoryAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess) &&
                        <Menu.Item key="inventory"><Link to="/inventory">Inventory</Link></Menu.Item>}
                    {(userInfo.hasInventoryAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess) &&
                        <Menu.Item key="orders"><Link to="/orders">Orders</Link></Menu.Item>}
                    {(userInfo.companyId === 3 || userInfo.hasAdminAccess) &&
                        <Menu.Item key="kits"><Link to="/kits">Albertson</Link></Menu.Item>}
                    {(userInfo.hasAdminAccess) &&
                        <Menu.Item key="kitsreports"><Link to="/kits/pgareports">Albertson Reports</Link></Menu.Item>}
                    {(userInfo.companyId === 17 || userInfo.hasAdminAccess) &&
                        <Menu.Item key="hillman"><Link to="/hillman">Hillman</Link></Menu.Item>}
                    {(userInfo.hasAdminAccess) &&
                        <Menu.Item key="hillmanreports"><Link to="/hillman/pgareports">Hillman Reports</Link></Menu.Item>}
                        <Menu.Item key="mediacontent"><Link to="/mediacontent">Media Content</Link></Menu.Item>

                </Menu>
            </Header>
            <Content style={{ padding: '0 50px', marginTop: 64 }}>
                <Switch>
                    {(userInfo.companyId === 3 || userInfo.hasAdminAccess)
                        && <Route exact path="/kits">
                            <KitTrackerPage />
                        </Route>}
                    {(userInfo.hasAdminAccess)
                        && <Route exact path="/kits/pgareports">
                            <KitTrackerReportsPage />
                        </Route>}
                    {(userInfo.companyId === 17 || userInfo.hasAdminAccess)
                        && <Route exact path="/hillman">
                            <HillmanPage />
                        </Route>}
                    {(userInfo.hasAdminAccess)
                        && <Route exact path="/hillman/pgareports">
                            <HillmanReportsPage />
                        </Route>}
                    {(userInfo.hasInventoryAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess) &&
                        <Route exact path="/inventory">
                            <InventoryPage />
                        </Route>}
                    {(userInfo.hasInventoryAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess)
                        && <Route exact path="/inventory/:itemId">
                            <InventoryDetails />
                        </Route>}
                    {(userInfo.hasOrdersAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess)
                        && <Route exact path="/orders">
                            <OrdersPage />
                        </Route>}
                    {(userInfo.hasOrdersAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess)
                        && <Route exact path="/orders/create">
                            <OrderCreatePage />
                        </Route>}
                    {(userInfo.hasOrdersAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess)
                        && <Route exact path="/orders/rollout">
                            <OrderEditRolloutPage />
                        </Route>}
                    {(userInfo.hasOrdersAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess)
                        && <Route exact path="/orders/:orderId">
                            <OrderDetailsPage />
                        </Route>}
                    {(userInfo.hasOrdersAccess || userInfo.hasManagerAccess || userInfo.hasAdminAccess)
                        && <Route exact path="/orders/:orderId/update">
                            <OrderCreatePage />
                        </Route>}
                    <Route exact path="/mediacontent">
                        <MediaContentPage />
                    </Route>
                    <Route exact path="/">
                        <HomePage userInfo={userInfo} />
                    </Route>
                    <Route render={() => <Redirect to="/" />} />
                </Switch>
            </Content>
            <MainFooter />
        </Layout>
    </HashRouter>
}

export default MainPage
