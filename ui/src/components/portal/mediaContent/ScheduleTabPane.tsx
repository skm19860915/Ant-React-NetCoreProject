import {Button, Col, Input, Row, Space, Table, DatePicker} from "antd";
import React, {FunctionComponent, useState, useEffect} from "react";
import {FilterDropdownProps, SortOrder} from "antd/es/table/interface";
import {EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, CopyOutlined} from "@ant-design/icons";
import moment from "moment";
import ScheduleEditModal from "./ScheduleEditModal";

interface MediaContentScheduleFilteredInfo {
    retailer: string[];
    region: string[];
    displayType: string[];
    scheduleName: string[];
    startDate: string[];
}

const initFilterInfo: MediaContentScheduleFilteredInfo = {
    retailer: [],
    region: [],
    displayType: [],
    scheduleName: [],
    startDate: [],
}

const {RangePicker} = DatePicker

const ScheduleTabPane: FunctionComponent<{
    mediaContentSchedule: any
}> = (props) => {
    const {mediaContentSchedule} = props
    const [mediaContentScheduleData, setMediaContentScheduleData] = useState([])

    const [filteredInfo, setFilteredInfo] = useState<MediaContentScheduleFilteredInfo>(initFilterInfo)
    const [sorterInfo, setSorterInfo] = useState({
        order: '',
        columnKey: ''
    })

    const [visibleScheduleModal, setVisibleScheduleModal] = useState(false)
    const [selectedScheduleId, setSelectedScheduleId] = useState()
    const [cloneSchedule, setCloneSchedule] = useState(false)

    useEffect(() => {
        setMediaContentScheduleData(mediaContentSchedule)
    }, [mediaContentSchedule])

    const handleChange = (pagination: any, filters: any, sorter: any) => {
        setFilteredInfo(filters)
        setSorterInfo(sorter)
    }

    const getColumnSearchProps = (dataIndex: string, kind: string) => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}: FilterDropdownProps) => (
            <div style={{padding: 8}}>
                {kind === 'text' && (
                    <Input
                        placeholder={`Search ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        style={{marginBottom: 8, display: 'block'}}
                    />
                )}
                {kind === 'date' && (
                    <RangePicker
                        onChange={(dates, dateStrings) => {
                            setSelectedKeys([JSON.stringify({start: dateStrings[0], end: dateStrings[1]})])
                        }
                        }
                        value={selectedKeys[0] ? [
                            moment(JSON.parse(selectedKeys[0] as string).start),
                            moment(JSON.parse(selectedKeys[0] as string).end),
                        ] : [null, null]}
                        style={{marginBottom: 8, display: 'block'}}
                    />
                )}
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{width: 90}}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{width: 90}}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({closeDropdown: false});
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: any) => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
        onFilter: (value: any, record: any) => {
            if (dataIndex === 'Schedule Name') {
                return record.scheduleName.toLowerCase().includes(value.toLowerCase())
            } else if (dataIndex === 'Start Date') {
                let startDiff = record.startDate.diff(moment(JSON.parse(value).start))
                let endDiff = moment(JSON.parse(value).end).diff(record.startDate)
                return startDiff >= 0 && endDiff >= 0
            }
            return true
        },
    });

    const handleSearch = (selectedKeys: any, confirm: any, dataIndex: string) => {
        confirm();
    };

    const handleReset = (clearFilters: any) => {
        clearFilters();
    };

    return (
        <>
            <ScheduleEditModal
                scheduleList={mediaContentScheduleData}
                visible={visibleScheduleModal}
                hide={() => setVisibleScheduleModal(false)}
                scheduleId={selectedScheduleId}
                setScheduleList={setMediaContentScheduleData}
                cloneSchedule={cloneSchedule}
            />
            <Row gutter={[16, 8]} align="bottom">
                <Col span={24} style={{textAlign: "right", marginBottom: 10}}>
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedScheduleId(undefined)
                            setVisibleScheduleModal(true)
                            setCloneSchedule(false)
                        }}
                        style={{marginRight: 10}}
                        ghost
                    >
                        <PlusOutlined/>
                        New Schedule
                    </Button>
                    <Button type="primary" onClick={() => {
                        setFilteredInfo(initFilterInfo)
                        setSorterInfo({
                            order: '',
                            columnKey: ''
                        })
                    }}>Clear Filter</Button>
                </Col>
            </Row>
            <Table
                rowKey={(record: any) => `${record.id}`}
                dataSource={mediaContentScheduleData}
                onChange={handleChange}
                columns={[
                    {
                        title: "Schedule Name",
                        key: "scheduleName",
                        dataIndex: 'scheduleName',
                        width: '10%',
                        ...getColumnSearchProps('Schedule Name', 'text'),
                        filteredValue: filteredInfo ? filteredInfo.scheduleName : null
                    },
                    {
                        title: "Retailer",
                        key: "retailer",
                        dataIndex: 'retailer',
                        sorter: (a, b) => a.retailer.localeCompare(b.retailer),
                        filters: [...(new Set(mediaContentScheduleData.map((item: any) => item.retailer)) as unknown as string[])]
                            .map((item) => ({
                                text: item,
                                value: item
                            })),
                        onFilter: (value: any, record: any) => {
                            return record.retailer === value
                        },
                        width: '10%',
                        sortOrder: (sorterInfo.columnKey === 'retailer' && sorterInfo.order) as SortOrder,
                        filteredValue: filteredInfo ? filteredInfo.retailer : null
                    },
                    {
                        title: "Region",
                        key: "region",
                        dataIndex: 'region',
                        sorter: (a, b) => a.region.localeCompare(b.region),
                        filters: [...(new Set(mediaContentScheduleData.map((item: any) => item.region)) as unknown as string[])]
                            .map((item) => ({
                                text: item,
                                value: item
                            })),
                        onFilter: (value: any, record: any) => {
                            return record.region === value
                        },
                        width: '10%',
                        sortOrder: (sorterInfo.columnKey === 'region' && sorterInfo.order) as SortOrder,
                        filteredValue: filteredInfo ? filteredInfo.region : null,
                    },
                    {
                        title: 'Display Type',
                        key: 'displayType',
                        dataIndex: 'displayType',
                        sorter: (a, b) => a.displayType.localeCompare(b.displayType),
                        filters: [...(new Set(mediaContentScheduleData.map((item: any) => item.displayType)) as unknown as string[])]
                            .map((item) => ({
                                text: item,
                                value: item
                            })),
                        onFilter: (value: any, record: any) => {
                            return record.displayType === value
                        },
                        width: '15%',
                        filteredValue: filteredInfo ? filteredInfo.displayType : null,
                        sortOrder: (sorterInfo.columnKey === 'displayType' && sorterInfo.order) as SortOrder,
                    },
                    {
                        title: "Start Date",
                        key: "startDate",
                        render: (_, record) => <div>{record.startDate.format('MM/DD/YYYY')}</div>,
                        sorter: (a, b) => a.startDate.diff(b.startDate),
                        width: '10%',
                        ...getColumnSearchProps('Start Date', 'date'),
                        sortOrder: (sorterInfo.columnKey === 'startDate' && sorterInfo.order) as SortOrder,
                        filteredValue: filteredInfo ? filteredInfo.startDate : null
                    },
                    {
                        title: "Video File",
                        key: "videoFile",
                        sorter: (a, b) => a.video.filename.localeCompare(b.video.filename),
                        render: (_, record) => <div>{record.video.filename}</div>,
                        width: '30%',
                        sortOrder: (sorterInfo.columnKey === 'videoFile' && sorterInfo.order) as SortOrder,
                    },
                    {
                        title: 'LED Color',
                        key: 'ledColor',
                        render: (_, record) => <div
                            style={{width: 20, height: 20, background: record.ledColor, margin: '0 auto'}}/>,
                        width: '7%',
                    },
                    {
                        title: "Action",
                        key: 'action',
                        render: (_, record) => (
                            <Row>
                                <Col span={8}>
                                    <Button
                                        type="text"
                                        onClick={() => {
                                            setSelectedScheduleId(record.id)
                                            setCloneSchedule(false)
                                            setVisibleScheduleModal(true)
                                        }}
                                    >
                                        <EditOutlined/>
                                    </Button>
                                </Col>
                                <Col span={8}>
                                    <Button
                                        type="text"
                                        onClick={() => {
                                            setSelectedScheduleId(record.id)
                                            setCloneSchedule(true)
                                            setVisibleScheduleModal(true)
                                        }}
                                    >
                                        <CopyOutlined/>
                                    </Button>
                                </Col>
                                <Col span={8}>
                                    <Button
                                        type="text"
                                        onClick={() => {
                                            setMediaContentScheduleData((mediaContentScheduleData) => mediaContentScheduleData.filter((item: any) => item.id !== record.id))
                                        }} danger>
                                        <DeleteOutlined/>
                                    </Button>
                                </Col>
                            </Row>
                        )
                    }
                ]}
                pagination={false}
                scroll={{y: "calc(100vh - 64px - 92px - 52px - 110px)"}}
            />
        </>
    );
};

export default ScheduleTabPane
