import { Button, Col, PageHeader, Row, Space, Spin, Table, Tabs } from "antd"
import Layout, { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent, useState } from "react"
import { useEffect, useCallback } from "react"
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons'
import KitTrackerApiService from "../../services/KitTrackerApiService"
import { KitCount, ReportData, StageCount } from "../../data/AlbertsonEntities"
import ReactExport from "react-export-excel"
import moment from "moment"

const ExcelFile = ReactExport.ExcelFile
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn

const { TabPane } = Tabs;

const KitTrackerReportsPage: FunctionComponent<{}> = props => {
    const [reportData, setReportData] = useState(undefined as ReportData | undefined)
    const [loading, setLoading] = useState(false)

    const refresh = useCallback(() => {
        setLoading(true)
        KitTrackerApiService.getReportData()
            .then(reportData => setReportData(reportData))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return <Layout className="layout" style={{ height: "100vh" }}>
        <Content>
            <Spin spinning={loading}>
                <Row justify="center">
                    <PageHeader
                        title={"Realtime Reports"}
                        subTitle={"(Current data)"}
                        extra={<Space>
                            <Button
                                type="primary"
                                icon={<SyncOutlined />}
                                onClick={refresh}
                            >
                                Refresh
                            </Button>
                            <ExcelFile
                                filename={`kittracker-export-${moment().format('MM-DD-yyyy')}`}
                                element={<Button type="primary" style={{ backgroundColor: "#0F783F" }} icon={<DownloadOutlined />}>Export XLSX</Button>}
                            >
                                <ExcelSheet data={reportData?.stageCounts ?? []} name="Stage Counts">
                                    <ExcelColumn label="Stage" value="stageName" />
                                    <ExcelColumn label="Count" value="count" />
                                </ExcelSheet>
                                <ExcelSheet data={reportData?.kitsByWeekCounts ?? []} name="Kits By Week">
                                    <ExcelColumn label="Week Of" value="weekOf" />
                                    <ExcelColumn label="Kit #" value="kitNumber" />
                                    <ExcelColumn label="Kit Description" value="kitName" />
                                    <ExcelColumn label="Stage" value="stageName" />
                                    <ExcelColumn label="Count" value="count" />
                                </ExcelSheet>
                                <ExcelSheet data={reportData?.itemsMovedToPackingToday ?? []} name="Packed Today">
                                    <ExcelColumn label="Serial #" value="serialNumber" />
                                    <ExcelColumn label="Stage" value="stageName" />
                                    <ExcelColumn label="Kit #" value="kitNumber" />
                                    <ExcelColumn label="Kit Description" value="kitName" />
                                    <ExcelColumn label="Week Of" value="weekOf" />
                                </ExcelSheet>
                                <ExcelSheet data={reportData?.itemsMovedToShippedToday ?? []} name="Shipped Today">
                                    <ExcelColumn label="Serial #" value="serialNumber" />
                                    <ExcelColumn label="Stage" value="stageName" />
                                    <ExcelColumn label="Kit #" value="kitNumber" />
                                    <ExcelColumn label="Kit Description" value="kitName" />
                                    <ExcelColumn label="Week Of" value="weekOf" />
                                </ExcelSheet>
                            </ExcelFile>
                        </Space>}
                    />
                </Row>
                <Row justify="center">
                    <Col span={16}>
                        {reportData &&
                            <Tabs animated={false} defaultActiveKey="stagecounts" style={{ width: '100%', margin: '0 16px' }}>
                                <TabPane tab="Stage Counts" key="stagecounts">
                                    <Table
                                        rowKey={record => record.stageName}
                                        dataSource={reportData.stageCounts ?? []}
                                        columns={[
                                            { title: "Stage", dataIndex: "stageName" },
                                            {
                                                title: "Count",
                                                key: "count",
                                                render: (_, record: StageCount) => {
                                                    return record.kitCounts.reduce((prev: KitCount, curr: KitCount) =>
                                                        ({ kitName: '', kitNumber: '', count: prev.count + curr.count } as KitCount))
                                                        .count.toString()
                                                }
                                            },
                                        ]}
                                        expandable={{
                                            expandedRowRender: record => <Table
                                                key={record.stageName}
                                                rowKey={record => record.kitName}
                                                pagination={false}
                                                dataSource={record.kitCounts}
                                                columns={[
                                                    { title: "Kit #", dataIndex: 'kitNumber' },
                                                    { title: "Kit Description", dataIndex: 'kitName' },
                                                    { title: "Count", dataIndex: 'count' },
                                                ]}
                                            />,
                                            rowExpandable: record => record.kitCounts.length > 0,
                                            defaultExpandAllRows: true
                                        }}
                                        pagination={false}
                                    />
                                </TabPane>
                                <TabPane tab="Kits By Week Of" key="weekof">
                                    <Table
                                        dataSource={reportData.kitsByWeekCounts ?? []}
                                        columns={[
                                            { title: "Week Of", dataIndex: "weekOf" },
                                            { title: "Kit #", dataIndex: "kitNumber" },
                                            { title: "Kit Description", dataIndex: "kitName" },
                                            { title: "Stage", dataIndex: "stageName" },
                                            { title: "Count", dataIndex: "count" },
                                        ]}
                                        pagination={false}
                                    />
                                </TabPane>
                                <TabPane tab={`Packed Today (${reportData?.itemsMovedToPackingToday?.length ?? 0})`} key="packedcount">
                                    <Table
                                        dataSource={reportData.itemsMovedToPackingToday ?? []}
                                        columns={[
                                            { title: "Serial #", dataIndex: "serialNumber" },
                                            { title: "Stage", dataIndex: "stageName" },
                                            { title: "Kit #", dataIndex: "kitNumber" },
                                            { title: "Kit Description", dataIndex: "kitName" },
                                            { title: "Week Of", dataIndex: "weekOf" },
                                        ]}
                                        pagination={false}
                                    />
                                </TabPane>
                                <TabPane tab={`Shipped Today (${reportData?.itemsMovedToShippedToday?.length ?? 0})`} key="shippedcount">
                                    <Table
                                        dataSource={reportData.itemsMovedToShippedToday ?? []}
                                        columns={[
                                            { title: "Serial #", dataIndex: "serialNumber" },
                                            { title: "Stage", dataIndex: "stageName" },
                                            { title: "Kit #", dataIndex: "kitNumber" },
                                            { title: "Kit Description", dataIndex: "kitName" },
                                            { title: "Week Of", dataIndex: "weekOf" },
                                        ]}
                                        pagination={false}
                                    />
                                </TabPane>
                            </Tabs>
                        }
                    </Col>
                </Row>
            </Spin>
        </Content>
    </Layout>
}

export default KitTrackerReportsPage