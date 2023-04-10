import { UploadOutlined } from '@ant-design/icons'
import { Button, Col, Form, Modal, Row, Upload } from 'antd'
import moment from 'moment'
import React, { FunctionComponent, useState } from 'react'
import { useHistory } from 'react-router'

const UploadRolloutCSVModal: FunctionComponent<{
    visible: boolean
    onCancel: () => void
}> = props => {
    const history = useHistory()
    const [orderFileData, setOrderFileData] = useState(null)

    const onCredInputFile = (file: any) => {
        let reader = new FileReader();
        const filename = file.name
        reader.onload = (e: any) => {
            if (filename.endsWith('.csv')) {
                const csv = e.target.result
                const lines = csv.split("\n");
                let orderData: any = []
                let headers = lines[0].split(",");
                for (let i = 1; i < lines.length - 1; i++) {
                    let currentLine = lines[i].split(",");

                    let obj: any = {}
                    for (let j = 0; j < 11; j++) {
                        obj[headers[j].trim()] = currentLine[j] ? currentLine[j].trim() : currentLine[j];
                    }
                    let orderItems: any = []
                    for (let j = 11; j < headers.length; j++) {
                        let val = currentLine[j] ? currentLine[j].trim() : currentLine[j];
                        if (val && val.length) {
                            orderItems = [
                                ...orderItems,
                                {
                                    itemName: headers[j].trim(),
                                    quantityOrdered: val,
                                    inStoreDate: moment(currentLine[0]),
                                    itemCode: headers[j].trim(),
                                }
                            ]
                        }
                    }
                    obj['orderItems'] = orderItems
                    orderData = [...orderData, obj]
                }
                setOrderFileData(orderData)
            }
        }
        reader.readAsText(file)
    }

    const orderUploadProps = {
        beforeUpload: (file: any) => {
            onCredInputFile(file)
            return false;
        },
    }

    const uploadRolloutCSV = () => {
        if (orderFileData) {
            history.push({
                pathname: '/orders/rollout',
                state: {
                    orderFileData: orderFileData
                }
            })
        }
    }

    return <Modal
        title="Upload Rollout CSV"
        onCancel={props.onCancel}
        onOk={uploadRolloutCSV}
        okText="Upload"
    >
        <Form>
            <Form.Item>
                <Upload {...orderUploadProps}>
                    <Button icon={<UploadOutlined />}>
                        Choose File
                    </Button>
                </Upload>
            </Form.Item>
        </Form>
    </Modal>
}

export default UploadRolloutCSVModal