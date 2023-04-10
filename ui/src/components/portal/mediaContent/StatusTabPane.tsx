import { Button, Col, Row, Table, Tooltip } from "antd";
import React, { FunctionComponent, useState, useEffect } from "react";
import { SortOrder } from "antd/es/table/interface";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCoffee, faDownload, faFileDownload, faSignal, faSyncAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { IMediaContentPlayer, IMediaContentRegion, IMediaContentStore, IMediaRegionKey, IMediaDisplayTypeKey } from "../../../data/PortalEntities";
interface MediaContentStatusFilteredInfo {
    mediaContentRetailer: string[];
    mediaContentRegion: string[];
    mediaContentDisplayType: string[];
}

const initFilterInfo: MediaContentStatusFilteredInfo = {
    mediaContentRetailer: [],
    mediaContentRegion: [],
    mediaContentDisplayType: []
}

const StatusTabPane: FunctionComponent<{
    mediaContent: IMediaContentStore[]
}> = (props) => {
    const { mediaContent } = props
    const [mediaContentData, setMediaContentData] = useState<IMediaContentStore[]>([])
    const [regionData, setRegionData] = useState<IMediaRegionKey[]>([]);
    const [displayTypedata, setDisplayTypedata] = useState<IMediaDisplayTypeKey[]>([]);
    const [selectedRegionRowKeys, setSelectedRegionRowKeys] = useState<any>([]);
    const [selectedDisplayTypeRowKeys, setSelectedDisplayTypeRowKeys] = useState<any>([])
    const [filteredInfo, setFilteredInfo] = useState<MediaContentStatusFilteredInfo>(initFilterInfo)
    const [sorterInfo, setSorterInfo] = useState({
        order: '',
        columnKey: ''
    })

    useEffect(() => {
        setMediaContentData(mediaContent);
        const regiondata: IMediaRegionKey[] = mediaContent.map((item: IMediaContentStore) => {
            return {
                key: item.mediaContentRegion.regionName,
                region: item.mediaContentRegion.regionName
            }
        })
        setRegionData(regiondata.filter(function (item: IMediaRegionKey, pos: number) {
            return regiondata.findIndex((ele: IMediaRegionKey) => ele.key === item.key) == pos;
        }))

        const displayTypedata = mediaContent.map((item: IMediaContentStore) => {
            return {
                key: item.mediaContentDisplayType.displayName,
                displayType: item.mediaContentDisplayType.displayName
            }
        })
        setDisplayTypedata(displayTypedata.filter(function (item: IMediaDisplayTypeKey, pos: number) {
            return displayTypedata.findIndex((ele: IMediaDisplayTypeKey) => ele.key === item.key) == pos;
        }))
    }, [mediaContent])

    useEffect(() => {
        setMediaContentData(mediaContent.filter((item: IMediaContentStore) => {
            return (selectedDisplayTypeRowKeys.length === 0 || selectedDisplayTypeRowKeys.includes(item.mediaContentDisplayType.displayName)) &&
                (selectedRegionRowKeys.length === 0 || selectedRegionRowKeys.includes(item.mediaContentRegion.regionName))
        }))
    }, [selectedDisplayTypeRowKeys, selectedRegionRowKeys])

    const handleChange = (pagination: any, filters: any, sorter: any) => {
        console.log(filters)
        setFilteredInfo(filters)
        setSorterInfo(sorter)
    }
    const onSelectRegionChange = (selectedRowKeys: any[]) => {
        console.log(selectedRowKeys)
        setSelectedRegionRowKeys(selectedRowKeys)
    }
    const onSelectDisplayTypeChange = (selectedRowKeys: any[]) => {
        setSelectedDisplayTypeRowKeys(selectedRowKeys)
    }
    const regionRowSelection = {
        selectedRegionRowKeys,
        onChange: onSelectRegionChange,
    };
    const regionColumns = [{
        title: 'Region',
        dataIndex: 'region',
    }];
    const displayTypeRowSelection = {
        selectedDisplayTypeRowKeys,
        onChange: onSelectDisplayTypeChange,
    };
    const displayTypeColumns = [{
        title: 'DisplayType',
        dataIndex: 'displayType',
    }];

    return (
        <>
            <Row gutter={[16, 8]} align="bottom">
                <Col span={24} style={{ textAlign: "right", marginBottom: 10 }}>
                    <Button type="primary" onClick={() => {
                        setFilteredInfo(initFilterInfo)
                        setSorterInfo({
                            order: '',
                            columnKey: ''
                        })
                    }}>Clear Filter</Button>
                </Col>
            </Row>
            <Row gutter={18}>
                <Col span="4" >
                    <Table
                        rowSelection={regionRowSelection} columns={regionColumns} dataSource={regionData}
                        pagination={false}
                        scroll={{ y: "calc(28vh)" }}
                    />
                    <br></br>
                    <Table
                        rowSelection={displayTypeRowSelection} columns={displayTypeColumns} dataSource={displayTypedata}
                        pagination={false}
                        scroll={{ y: "calc(28vh)" }}
                    />
                </Col>
                <Col span="20" >
                    <Table
                        rowKey={(record: any) => `${record.id}`}
                        dataSource={mediaContentData}
                        onChange={handleChange}
                        columns={[
                            {
                                title: "Retailer",
                                key: "mediaContentDisplayType",
                                dataIndex: 'mediaContentDisplayType',
                                render: item => {
                                    return item.mediaContentRetailer.retailerName
                                },
                                sorter: (a, b) => a.mediaContentDisplayType.mediaContentRetailer.retailerName.localeCompare(b.mediaContentDisplayType.mediaContentRetailer.retailerName),
                                filters: [...(new Set(mediaContentData.map((item: IMediaContentStore) => item.mediaContentDisplayType.mediaContentRetailer.retailerName)) as unknown as string[])]
                                    .map((item) => ({
                                        text: item,
                                        value: item
                                    })),
                                onFilter: (value: any, record: any) => {
                                    return record.mediaContentDisplayType.mediaContentRetailer.retailerName === value
                                },
                                width: '10%',
                                sortOrder: (sorterInfo.columnKey === 'mediaContentDisplayType' && sorterInfo.order) as SortOrder,
                                filteredValue: filteredInfo ? filteredInfo.mediaContentRetailer : null
                            },
                            {
                                title: "Region",
                                key: "mediaContentRegion",
                                dataIndex: 'mediaContentRegion',
                                render: item => item.regionName,
                                sorter: (a, b) => a.mediaContentRegion.regionName.localeCompare(b.mediaContentRegion.regionName),
                                filters: [...(new Set(mediaContentData.map((item: IMediaContentStore) => item.mediaContentRegion.regionName)) as unknown as string[])]
                                    .map((item) => ({
                                        text: item,
                                        value: item
                                    })),
                                onFilter: (value: any, record: any) => {
                                    return record.mediaContentRegion.regionName === value
                                },
                                width: '7%',
                                sortOrder: (sorterInfo.columnKey === 'mediaContentRegion' && sorterInfo.order) as SortOrder,
                                filteredValue: filteredInfo ? filteredInfo.mediaContentRegion : null,
                            },
                            {
                                title: "Store #",
                                key: "storeNumber",
                                dataIndex: 'storeNumber',
                                width: '5%',
                            },
                            {
                                title: 'Display Type',
                                key: 'mediaContentDisplayType',
                                dataIndex: 'mediaContentDisplayType',
                                render: item => item.displayName,
                                sorter: (a, b) => a.mediaContentDisplayType.displayName.localeCompare(b.mediaContentDisplayType.displayName),
                                filters: [...(new Set(mediaContentData.map((item: IMediaContentStore) => item.mediaContentDisplayType.displayName)) as unknown as string[])]
                                    .map((item) => ({
                                        text: item,
                                        value: item
                                    })),
                                onFilter: (value: any, record: any) => {
                                    return record.mediaContentDisplayType.displayName === value
                                },
                                width: '10%',
                                sortOrder: (sorterInfo.columnKey === 'mediaContentDisplayType' && sorterInfo.order) as SortOrder,
                                filteredValue: filteredInfo ? filteredInfo.mediaContentDisplayType : null,
                            },
                            {
                                title: "Store Name",
                                key: "storeName",
                                dataIndex: 'storeName',
                                sorter: (a, b) => a.storeName.localeCompare(b.storeName),
                                width: '10%',
                                sortOrder: (sorterInfo.columnKey === 'storeName' && sorterInfo.order) as SortOrder,

                            },
                            {
                                title: "Street",
                                key: "street1",
                                dataIndex: 'street1',
                                sorter: (a, b) => a.street1.localeCompare(b.street1),
                                width: '10%',
                                sortOrder: (sorterInfo.columnKey === 'street' && sorterInfo.order) as SortOrder,
                            },
                            {
                                title: "City",
                                key: 'city',
                                dataIndex: "city",
                                sorter: (a, b) => a.city.localeCompare(b.city),
                                width: '8%',
                                sortOrder: (sorterInfo.columnKey === 'city' && sorterInfo.order) as SortOrder,
                            },
                            {
                                title: 'State',
                                key: 'state',
                                dataIndex: 'state',
                                sorter: (a, b) => a.state.localeCompare(b.state),
                                width: '5%',
                                sortOrder: (sorterInfo.columnKey === 'state' && sorterInfo.order) as SortOrder,
                            },
                            {
                                title: 'Zip code',
                                key: 'postalCode',
                                dataIndex: 'postalCode',
                                width: '5%',
                            },
                            {
                                title: 'LED Color',
                                key: 'ledColor',
                                render: (_, record) => <div style={{ width: 40, height: 40, background: `rgb(${record.ledColor})`, margin: '0 auto' }} />,
                                width: '7%',
                            },
                            {
                                title: 'Players',
                                key: 'mediaTitle',
                                render: (_, record) => <>
                                    {record.players.map((player: IMediaContentPlayer, idx: number) =>
                                        <Tooltip title={
                                            player.lastResponse && (
                                                <>
                                                {player.updatingContent === true && "Updating content..."}
                                                {player.updatingSoftware === true && "Updating software...."}
                                                {player.lastPowerCycle && "Power cycling..."}
                                                {!player.updatingContent && !player.updatingSoftware && !player.lastPowerCycle && "Last online " + player.lastResponse}
                                                </>
                                            )
                                        }>
                                            <p key={idx}>
                                                {player.lastResponse && (
                                                    <>
                                                        {player.updatingContent === true && <FontAwesomeIcon icon={faFileDownload} color="blue" />}
                                                        {player.updatingSoftware === true && <FontAwesomeIcon icon={faDownload} color="blue" />}
                                                        {player.lastPowerCycle && <FontAwesomeIcon icon={faSyncAlt} color="black" />}
                                                        {!player.updatingContent && !player.updatingSoftware
                                                            && !player.lastPowerCycle && <FontAwesomeIcon icon={faTimes} color="red" />}
                                                    </>
                                                )}
                                                &nbsp;{player.displayLocationIndex}&nbsp;:&nbsp;{player.uploadedFile.fileName}
                                            </p>
                                        </Tooltip>
                                    )
                                    }
                                </>
                            }
                        ]}
                        pagination={false}
                        scroll={{ y: "calc(62vh)" }}
                    />
                </Col>
            </Row>
        </>
    );
};

export default StatusTabPane
