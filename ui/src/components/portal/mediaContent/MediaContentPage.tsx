import {Layout, message, PageHeader, Spin, Table, Input, DatePicker, Select, Button, Row, Col, Space, Tabs} from "antd";
import {Content} from "antd/lib/layout/layout";
import moment from "moment";
import React, {FunctionComponent, useCallback, useState, useEffect} from "react";
import {IMediaContentStore, Order, ShipTicketFreightInfo} from "../../../data/PortalEntities";
import OrdersApiService from "../../../services/OrdersApiService";
import {Link} from "react-router-dom"
import {SearchOutlined} from '@ant-design/icons';
import {FilterDropdownProps, SortOrder} from "antd/es/table/interface";
import StatusTabPane from "./StatusTabPane";
import { fakeScheduleList } from "../../../helper/global";
import ScheduleTabPane from "./ScheduleTabPane";
import MediaContentStoresApiService from "../../../services/MediaContentStoresApiService";

const { TabPane } = Tabs

const MediaContentPage: FunctionComponent = (props) => {
    const [mediaContentStores, setMediaContentStores] = useState<IMediaContentStore[]>([])

    useEffect(() => {
        setLoading(true)

        MediaContentStoresApiService
            .getMediaContentStores()
            .then(result => {
                setMediaContentStores(result);
                console.log(result);
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const [loading, setLoading] = useState(false);
    // @ts-ignore
    return (
        <Layout
            className="layout"
            style={{
                height: "calc(100vh - 64px - 92px)",
                width: "100%",
                position: "fixed",
                left: 0,
            }}
        >
            <Content
                style={{
                    padding: "0 50px",
                    height: "calc(100vh - 64px - 92px - 72px)",
                    marginTop: '20px'
                }}
            >
                <Row>
                    <Col span={24}>
                        <Spin spinning={loading}>
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="Status" key="status">
                                    <StatusTabPane mediaContent={mediaContentStores} />
                                </TabPane>
                                <TabPane tab="Schedule" key="2">
                                    <ScheduleTabPane mediaContentSchedule={fakeScheduleList} />
                                </TabPane>
                            </Tabs>
                        </Spin>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default MediaContentPage
