import { Modal, message, Upload, Button, Table } from "antd"
import { FunctionComponent, useCallback, useEffect, useState } from "react"
import { WorkOrder } from "../../data/HillmanEntities"
import HillmanApiService from "../../services/HillmanApiService"
import XLSX from 'xlsx'
import { UploadOutlined } from "@ant-design/icons"

const UploadASNModal: FunctionComponent<{
    visible: boolean
    onCancel: () => void
    onUpdated: () => void
}> = props => {

    const [loading, setLoading] = useState(false)
    const [newWorkOrders, setNewWorkOrders] = useState<WorkOrder[]>()

    useEffect(() => {
        setNewWorkOrders(undefined)
    }, [props])

    const beforeUpload = useCallback(file => {
        const reader = new FileReader();

        reader.onload = e => {
            let readedData = XLSX.read(e.target?.result, { type: 'binary' });
            const wsname = readedData.SheetNames[0];
            const ws = readedData.Sheets[wsname];

            /* Convert array to json*/
            const dataParse = XLSX.utils.sheet_to_json<(string | number[])>(ws, { header: 1 })

            const newWorkOrders = [] as WorkOrder[]
            dataParse.forEach((r, idx) => idx > 0 && r.length > 0 && newWorkOrders.push({
                workOrderId: -1,
                hwoNumber: `${r[0]}WO02`,
                itemNumber: r[1].toString(),
                bulkPartName: r[2] as string,
                expectedQuantity: r[9] as number,
                countryOfOrigin: r[11] as string,
                bulkPartNumber: r[16].toString(),
                rework: false,
                complete: false,
                pgawoNumber: 0,
                averageLaborRate: 0,
                labelCSVExported: false
            } as WorkOrder))

            setNewWorkOrders(newWorkOrders)
        };
        reader.readAsBinaryString(file);

        return false; // Prevent upload
    }, [])

    const onOk = useCallback(() => {
        setLoading(true)
        if (newWorkOrders !== undefined)
            HillmanApiService.uploadASN(newWorkOrders)
                .then(_ => {
                    message.success('ASN uploaded successfully.')
                    props.onUpdated()
                })
                .catch((e: Error) => message.error(e.message))
                .finally(() => setLoading(false))
    }, [newWorkOrders, props])

    return <Modal
        title={'Upload ASN'}
        onOk={onOk}
        onCancel={props.onCancel}
        visible={props.visible}
        okButtonProps={{ loading: loading, disabled: newWorkOrders === undefined }}
        width={newWorkOrders === undefined ? undefined : "100%"}
        okText="Upload"
    >
        {newWorkOrders === undefined
            ? <Upload
                accept=".xlsx"
                beforeUpload={beforeUpload}
                multiple={false}
                showUploadList={false}
            >
                <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            : <Table
                rowKey={(record) => record.workOrderId}
                dataSource={newWorkOrders}
                scroll={{ y: 'calc(100vh - 250px)' }}
                columns={[
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
                        title: "Country of Origin",
                        dataIndex: "countryOfOrigin"
                    }
                ]}
                pagination={false}
            />
        }
    </Modal>
}

export default UploadASNModal
