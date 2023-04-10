import { Button, Checkbox, message, PageHeader, Popconfirm, Row, Space, Spin, Switch, Table, Tabs } from "antd"
import Layout, { Content } from "antd/lib/layout/layout"
import React, { FunctionComponent, useState } from "react"
import { useEffect, useCallback } from "react"
import { DeleteOutlined, EditOutlined, PlusOutlined, SyncOutlined, UploadOutlined } from '@ant-design/icons'
import { ASNDataRow, LabelDataRow, Pallet, WorkOrder, WorkOrderLabelExportStatus } from "../../data/HillmanEntities"
import { CSVLink } from "react-csv"
import moment from "moment"
import HillmanApiService from "../../services/HillmanApiService"
import WorkOrderEditModal from "./WorkOrderEditModal"
import UploadASNModal from "./UploadASNModal"

const { TabPane } = Tabs;

const HillmanReportsPage: FunctionComponent<{}> = props => {
    const [labelData, setLabelData] = useState<LabelDataRow[]>()
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>()
    const [pallets, setPallets] = useState<Pallet[]>()
    const [asnData, setASNData] = useState<ASNDataRow[]>()
    const [loading, setLoading] = useState(false)
    const [onlyShowNetYetPrinted, setOnlyShowNetYetPrinted] = useState(false)
    const [onlyShowReadyToShip, setOnlyShowReadyToShip] = useState(false)
    const [labelSelectedWoNumbers, setLabelSelectedWoNumbers] = useState([] as number[])
    const [selectedPalletNumbers, setSelectedPalletNumbers] = useState([] as string[])
    const [editWorkOrderModalVisible, setEditWorkOrderModalVisible] = useState(false)
    const [importASNModalVisible, setImportASNModalVisible] = useState(false)
    const [editWorkOrder, setEditWorkOrder] = useState<WorkOrder>()

    const refresh = useCallback(() => {
        setLoading(true)
        HillmanApiService.getOpenOrdersLabelData()
            .then(labelData => setLabelData(labelData))
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
        HillmanApiService.getPallets()
            .then(pallets => setPallets(pallets))
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
        HillmanApiService.getWorkOrders()
            .then(workOrders => setWorkOrders(workOrders))
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const submitPrintedStatus = useCallback(printedStatus => {
        setLoading(true)
        HillmanApiService
            .updateWorkOrdersLabelExportedStatus(labelSelectedWoNumbers
                .map(woNumber => ({
                    workOrderId: woNumber,
                    labelCSVExported: printedStatus
                } as WorkOrderLabelExportStatus)))
            .then(result => {
                if (result) {
                    message.success("Work order label printed status updated successfully")
                    refresh()
                }
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [labelSelectedWoNumbers, refresh])

    const submitSendASNEmail = useCallback(() => {
        setLoading(true)
        HillmanApiService
            .emailASNCSV(selectedPalletNumbers)
            .then(result => {
                if (result) {
                    message.success("Emailed ASN CSV file to customer successfully successfully")
                    setSelectedPalletNumbers([])
                    refresh()
                }
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [refresh, selectedPalletNumbers])

    const updateASNPreview = useCallback(() => {
        HillmanApiService
            .getASNData(selectedPalletNumbers)
            .then(asnData => setASNData(asnData))
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [selectedPalletNumbers])

    const startEditWorkOrder = useCallback((workOrder?: WorkOrder) => {
        setEditWorkOrder(workOrder)
        setEditWorkOrderModalVisible(true)
    }, [])

    const archiveWorkOrder = useCallback((workOrderId: number) => {
        HillmanApiService
            .archiveWorkOrder(workOrderId)
            .then(_ => {
                message.success('Archived work order successfully.')
                refresh()
            })
            .catch((e: Error) => message.error(e.message))
            .finally(() => setLoading(false))
    }, [refresh])

    return <Layout className="layout" style={{ height: "100vh" }}>
        <WorkOrderEditModal
            visible={editWorkOrderModalVisible}
            onCancel={() => setEditWorkOrderModalVisible(false)}
            onUpdated={() => {
                setEditWorkOrderModalVisible(false)
                refresh()
            }}
            workOrder={editWorkOrder ?? {
                workOrderId: 0,
                hwoNumber: '',
                itemNumber: '',
                bulkPartNumber: '',
                bulkPartName: '',
                expectedQuantity: 0,
                labelCSVExported: false,
                rework: false,
                complete: false,
                countryOfOrigin: '',
                averageLaborRate: 0
            }}
        />
        <UploadASNModal
            visible={importASNModalVisible}
            onCancel={() => setImportASNModalVisible(false)}
            onUpdated={() => {
                setImportASNModalVisible(false)
                refresh()
            }}
        />
        <Content>
            <Spin spinning={loading}>
                <Row justify="center">
                    <PageHeader
                        title={"Realtime Reports"}
                        subTitle={"(Current data)"}
                        extra={
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SyncOutlined />}
                                    onClick={refresh}
                                >
                                    Refresh
                                </Button>
                            </Space>
                        }
                    />
                    <Tabs animated={false} defaultActiveKey="manageworkorders" style={{ width: '100%', margin: '0 16px' }}>
                        <TabPane tab="Manage Work Orders" key="manageworkorders">
                            <Button style={{ marginLeft: 10 }} type="primary" onClick={() => startEditWorkOrder()}>
                                <PlusOutlined /> Create Work Order
                            </Button>
                            <Button style={{ marginLeft: 10 }} type="primary" onClick={() => setImportASNModalVisible(true)}>
                                <UploadOutlined /> Upload ASN
                            </Button>
                            {workOrders !== undefined &&
                                <Table
                                    rowKey={(record) => record.workOrderId}
                                    dataSource={workOrders}
                                    columns={[
                                        {
                                            title: "Complete",
                                            key: "complete",
                                            render: (_, workOrder: WorkOrder) => <Checkbox checked={workOrder.complete} />
                                        },
                                        {
                                            title: "HWO #",
                                            dataIndex: "hwoNumber"
                                        },
                                        {
                                            title: "Item #",
                                            dataIndex: "itemNumber"
                                        },
                                        {
                                            title: "Bulk Part #",
                                            dataIndex: "bulkPartNumber"
                                        },
                                        {
                                            title: "Bulk Part Name",
                                            dataIndex: "bulkPartName"
                                        },
                                        {
                                            title: "Expected Quantity",
                                            dataIndex: "expectedQuantity"
                                        },
                                        {
                                            title: "Rework",
                                            key: "rework",
                                            render: (_, workOrder: WorkOrder) => <Checkbox checked={workOrder.rework} />
                                        },
                                        {
                                            title: "Country of Origin",
                                            dataIndex: "countryOfOrigin"
                                        },
                                        {
                                            title: "",
                                            render: (_, workOrder: WorkOrder) => <span>
                                                <Button style={{ marginLeft: 10 }} type="dashed" onClick={() => startEditWorkOrder(workOrder)}>
                                                    <EditOutlined />
                                                </Button>
                                                <Popconfirm okText="Archive" onConfirm={() => archiveWorkOrder(workOrder.workOrderId)} title="Are you sure you want to archive this order item?">
                                                    <Button type="primary" danger><DeleteOutlined /></Button>
                                                </Popconfirm>
                                            </span>
                                        }
                                    ]}
                                    pagination={false}
                                />}
                        </TabPane>
                        <TabPane tab="Export Label CSV" key="exportlabelcsv">
                            {labelData !== undefined && <>
                                <Space>
                                    {labelSelectedWoNumbers.length === 0
                                        ? <Button disabled>Export CSV</Button>
                                        : <CSVLink
                                            headers={[
                                                { label: 'SALES#', key: 'salesNumber' },
                                                { label: 'HWO', key: 'hwoNumber' },
                                                { label: 'HP#', key: 'partNumber' },
                                                { label: 'PartName', key: 'partName' },
                                                { label: 'Qty', key: 'quantity' },
                                                { label: 'Item#', key: 'itemNumber' },
                                                { label: 'LabelQty', key: 'labelQuantity' }
                                            ]}
                                            data={labelData.filter(l => labelSelectedWoNumbers.includes(l.salesNumber))}
                                            filename={'hillman-labels.csv'}
                                        >
                                            <Button>Export CSV</Button>
                                        </CSVLink>
                                    }
                                    <Button onClick={() => submitPrintedStatus(true)} disabled={labelSelectedWoNumbers.length === 0}>Set to "Printed"</Button>
                                    <Button onClick={() => submitPrintedStatus(true)} disabled={labelSelectedWoNumbers.length === 0}>Set to "Not Yet Printed"</Button>
                                </Space>
                                <br /><br />
                                <Space><Switch onChange={checked => setOnlyShowNetYetPrinted(checked)} />Only Show "Not Yet Printed"</Space>
                                <br /><br />
                                <Table
                                    rowKey={record => record.salesNumber}
                                    dataSource={labelData.sort((a, b) => b.salesNumber - a.salesNumber).filter(r => !onlyShowNetYetPrinted || !r.labelCSVExported)}
                                    columns={[
                                        { title: "Sales #", dataIndex: "salesNumber" },
                                        { title: "Hillman WO#", dataIndex: "hwoNumber" },
                                        { title: "Item #", dataIndex: "itemNumber" },
                                        { title: "Part #", dataIndex: "partNumber" },
                                        { title: "Part Name", dataIndex: "partName" },
                                        { title: "Ordered Quantity", dataIndex: "quantity" },
                                        { title: "Label Quantity", dataIndex: "labelQuantity" },
                                        {
                                            title: "Label Export Status",
                                            key: "labelCSVExport",
                                            render: (_, record: LabelDataRow) => record.labelCSVExported ? 'Printed' : 'Not Yet Printed'
                                        },
                                    ]}
                                    pagination={false}
                                    rowSelection={{
                                        type: 'checkbox',
                                        onChange: (_, selectedRows: LabelDataRow[]) => {
                                            setLabelSelectedWoNumbers(selectedRows.map(r => r.salesNumber))
                                        },
                                        selectedRowKeys: labelSelectedWoNumbers as React.Key[]
                                    }}
                                />
                            </>}
                        </TabPane>
                        <TabPane tab="Export ASN CSV" key="exportasncsv">
                            {pallets !== undefined && <>
                                <Space>

                                    {asnData === undefined || selectedPalletNumbers.length === 0
                                        ? <Button disabled>Export CSV</Button>
                                        : <CSVLink
                                            headers={[
                                                { label: 'POORD', key: 'hwoNumber' },
                                                { label: 'POLIN', key: 'empty' },
                                                { label: 'POITEM', key: 'itemNumber' },
                                                { label: 'POQTY', key: 'empty' },
                                                { label: 'POSQTY', key: 'cartonQuantity' },
                                                { label: 'POIPRC', key: 'empty' },
                                                { label: 'POIUOM', key: 'empty' },
                                                { label: 'POUMCV', key: 'empty' },
                                                { label: 'POIMPK', key: 'empty' },
                                                { label: 'POCSID', key: 'caseNumber' },
                                                { label: 'POPLT', key: 'palletNumber' },
                                                { label: 'POSHP', key: 'pgaDateString' }
                                            ]}
                                            data={
                                                pallets
                                                    .filter(p => selectedPalletNumbers.includes(p.palletNumber))
                                                    .map(p => ({ ...p, empty: '' }))
                                            }
                                            filename={moment().format('MMDDYY') + ' Masterv2.csv'}
                                        >
                                            <Button>Export CSV</Button>
                                        </CSVLink>
                                    }
                                    <Button onClick={submitSendASNEmail} disabled={selectedPalletNumbers.length === 0}>Send Email to Customer</Button>
                                </Space>
                                <br /><br />
                                <Space><Switch onChange={checked => setOnlyShowReadyToShip(checked)} />Only Show "Ready to Ship"</Space>
                                <br /><br />
                                <Table
                                    rowKey={record => record.palletNumber}
                                    dataSource={pallets.sort((a, b) => b.palletNumber.localeCompare(a.palletNumber)).filter(p => !onlyShowReadyToShip || p.palletStatusName === 'ReadyToShip')}
                                    columns={[
                                        { title: "Sales #", dataIndex: "workOrderId" },
                                        { title: "Hillman WO#", dataIndex: "hwoNumber" },
                                        { title: "Pallet #", dataIndex: "palletNumber" },
                                        { title: "Status", dataIndex: "palletStatusName" },
                                        { title: "Ship Date", dataIndex: "shipDateString" },
                                        { title: "Pallet PO", dataIndex: "palletPO" },
                                        { title: "Last Crew Size", dataIndex: "lastCrewSize" },
                                        { title: "Last Stop Reason", dataIndex: "stopReasonName" },
                                        { title: "Last QA Notes", dataIndex: "lastQANotes" },
                                        { title: "ASNID", dataIndex: "asnid" }
                                    ]}
                                    pagination={false}
                                    rowSelection={{
                                        type: 'checkbox',
                                        onChange: (_, selectedRows: Pallet[]) => {
                                            setSelectedPalletNumbers(selectedRows.map(r => r.palletNumber))
                                            updateASNPreview()
                                        },
                                        selectedRowKeys: selectedPalletNumbers as React.Key[]
                                    }}

                                />
                            </>}
                        </TabPane>
                    </Tabs>
                </Row>
            </Spin>
        </Content>
    </Layout>
}

export default HillmanReportsPage