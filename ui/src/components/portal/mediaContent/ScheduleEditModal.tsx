import {Button, DatePicker, Form, Input, Modal, Select, Upload} from "antd"
import useForm from "antd/lib/form/hooks/useForm"
import {FunctionComponent, useCallback, useEffect, useState} from "react"
import {fakeColors, fakeDisplayTypes, fakeRegions, fakeRetailers} from "../../../helper/global";
import {UploadOutlined} from "@ant-design/icons";

const {Option} = Select


const ScheduleEditModal: FunctionComponent<{
    scheduleList: any[],
    setScheduleList: React.Dispatch<React.SetStateAction<any>>,
    visible: boolean
    hide: () => void
    scheduleId: number | undefined
    cloneSchedule: boolean
}> = props => {

    const {scheduleList, hide, scheduleId, visible, setScheduleList, cloneSchedule} = props

    const [form] = useForm()
    const [selectedLedColor, setSelectedLedColor] = useState('')

    const videoUploadProps = {
        beforeUpload: (file: any) => {
            onCredInputFile(file)
            return false;
        },
    }

    const onCredInputFile = (file: any) => {
        let reader = new FileReader();
        const filename = file.name
        reader.onload = (e: any) => {
            const csv = e.target.result
        }
        reader.readAsText(file)
    }

    useEffect(() => form.resetFields(), [form, visible])

    useEffect(() => {
        if (scheduleId) {
            const selectedSchedule = scheduleList.filter(schedule => schedule.id === scheduleId)?.[0]
            form.setFieldsValue({
                ...selectedSchedule
            })
        }
    }, [form, scheduleId, scheduleList])

    const onOk = useCallback(() => {
        form.validateFields().then(values => {
            if(scheduleId && !cloneSchedule) {
                setScheduleList((mediaContentScheduleData: any) => mediaContentScheduleData.map((item: any) => item.id === scheduleId ? {
                    id: scheduleId,
                    retailer: values.retailer,
                    region: values.region,
                    scheduleName: values.scheduleName,
                    startDate: values.startDate,
                    video: {
                        filename: values.video.file ? values.video.file.name : item.video.filename,
                        filepath: values.video.file ? values.video.file.name : item.video.filepath
                    },
                    displayType: values.displayType,
                    ledColor: values.ledColor,
                } : item))
            } else {
                let selectedSchedule: any = null;
                if(cloneSchedule && scheduleId) {
                    selectedSchedule = scheduleList.filter(item => item.id === scheduleId)?.[0]
                }
                setScheduleList((mediaContentScheduleData: any) => ([
                    ...mediaContentScheduleData,
                    {
                        id: mediaContentScheduleData.length + 2,
                        retailer: selectedSchedule.retailer,
                        region: selectedSchedule.region,
                        scheduleName: values.scheduleName,
                        startDate: values.startDate,
                        video: selectedSchedule ? selectedSchedule.video : {
                            filename: values.video.file ? values.video.file.name : "",
                            filepath: values.video.file ? values.video.file.name : ""
                        },
                        displayType: selectedSchedule.displayType,
                        ledColor: selectedSchedule.ledColor,
                    },
                ]))
            }
            hide()
        })
    }, [cloneSchedule, form, hide, scheduleId, scheduleList, setScheduleList])

    return <Modal
        title={`${scheduleId ? 'Update Schedule' : 'Add to Schedule'}`}
        onOk={onOk}
        onCancel={hide}
        visible={visible}
    >
        <Form
            form={form}
            // initialValues={shipToIndex === undefined ? undefined : order.orderShipToLocations[shipToIndex]}
            layout="vertical"
        >
            <Form.Item
                label="Schedule Name"
                name='scheduleName'
                required
                rules={[{required: true, message: "Schedule name is required."}]}
            >
                <Input autoFocus/>
            </Form.Item>
            <Form.Item
                label="Retailer"
                name='retailer'
                required
                rules={[{required: true, message: "Retailer is required."}]}
            >
                <Select disabled={cloneSchedule}>
                    {fakeRetailers.map(retailer => (
                        <Option value={retailer}>{retailer}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                label="Region"
                name='region'
                required
                rules={[{required: true, message: "Region is required."}]}
            >
                <Select disabled={cloneSchedule}>
                    {fakeRegions.map(region => (
                        <Option value={region}>{region}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                label="Display Type"
                name='displayType'
                required
                rules={[{required: true, message: "Display type is required."}]}
            >
                <Select disabled={cloneSchedule}>
                    {fakeDisplayTypes.map(displayType => (
                        <Option value={displayType}>{displayType}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                label="Start Date"
                name='startDate'
                required
                rules={[
                    {
                        required: true,
                        message: "Start date is required."
                    }
                ]}
            >
                <DatePicker style={{width: '100%'}} format="MM/DD/YYYY"/>
            </Form.Item>
            <div style={{display: 'flex', alignItems: 'end'}}>
                <Form.Item
                    label="LED Color"
                    name='ledColor'
                    style={{width: '100%'}}
                    required
                    rules={[
                        {
                            required: true,
                            message: "LED color is required."
                        }
                    ]}
                >
                    <Select
                        className="led-color"
                        onChange={(value: string, option) => {
                            setSelectedLedColor(value)
                        }}
                        style={{width: '98%'}}
                        disabled={cloneSchedule}
                    >
                        {fakeColors.map(color => (
                            <Option
                                value={`rgb(${color.color.r}, ${color.color.g}, ${color.color.b})`}>{color.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        background: form.getFieldValue('ledColor') ?
                            form.getFieldValue('ledColor') :
                            scheduleId ? scheduleList.filter(item => item.id === scheduleId)?.[0]?.ledColor : '#fff',
                        border: '1px solid #000',
                        marginBottom: 25
                    }}
                />
                {/*<div style={{width: 32, height: 32, background: selectedLedColor.length ? selectedLedColor : '#fff', border: '1px solid #000', marginBottom: 25 }}/>*/}
            </div>
            <Form.Item
                name="video"
                label="Video"
                required={!scheduleId}
                rules={[
                    {
                        required: true,
                        message: "Video is required."
                    }
                ]}
            >
                <Upload name="filename" {...videoUploadProps}>
                    <Button icon={<UploadOutlined/>}>
                        Choose File
                    </Button>
                </Upload>
            </Form.Item>

        </Form>
    </Modal>
}

export default ScheduleEditModal
