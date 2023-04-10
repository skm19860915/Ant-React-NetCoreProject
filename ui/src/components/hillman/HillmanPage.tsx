import { message } from "antd"
import React, { FunctionComponent, useState } from "react"
import { useEffect } from "react"
import { WorkOrder } from "../../data/HillmanEntities"
import HillmanApiService from "../../services/HillmanApiService"
import SelectWorkOrderPage from "./SelectWorkOrderPage"
import UpdateWorkOrderDetailsPage from "./UpdateWorkOrderDetailsPage"
import StartPalletPage from "./StartPalletPage"
import CaseScanPage from "./CaseScanPage"

const HillmanPage: FunctionComponent<{}> = props => {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
    const [selectedWo, setSelectedWo] = useState<WorkOrder>()
    const [methodNames, setMethodNames] = useState<string[]>()
    const [materialSizeNames, setMaterialSizeNames] = useState<string[]>()
    const [stopReasons, setStopReasons] = useState<string[]>()
    const [selectedPalletNumber, setSelectedPalletNumber] = useState<string>()
    const [defaultCrewSize, setDefaultCrewSize] = useState(1)
    const [defaultCartonQty, setDefaultCartonQty] = useState(4)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)

        HillmanApiService
            .getWorkOrders()
            .then(result => setWorkOrders(result))
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })

        HillmanApiService
            .getPackoutMethods()
            .then(result => setMethodNames(result))
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })

        HillmanApiService
            .getPackoutMaterialSizes()
            .then(result => setMaterialSizeNames(result))
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })

        HillmanApiService
            .getPalletStopReasons()
            .then(result => setStopReasons(result))
            .catch((e: Error) => message.error(e.message))
            .finally(() => {
                setLoading(false)
            })
    }, [])

    return selectedWo === undefined
        ? <SelectWorkOrderPage
            workOrders={workOrders}
            setSelectedWo={setSelectedWo}
            loading={loading}
        />
        : (selectedWo.methodName === null || selectedWo.materialSizeName === null)
            && methodNames !== undefined && materialSizeNames !== undefined
            ? <UpdateWorkOrderDetailsPage
                loading={loading}
                methodNames={methodNames}
                materialSizeNames={materialSizeNames}
                selectedWo={selectedWo}
                setLoading={setLoading}
                setSelectedWo={setSelectedWo}
            />
            : selectedPalletNumber === undefined
                ? <StartPalletPage
                    selectedWo={selectedWo}
                    loading={loading}
                    setLoading={setLoading}
                    setSelectedPalletNumber={setSelectedPalletNumber}
                    defaultCrewSize={defaultCrewSize}
                    setDefaultCrewSize={setDefaultCrewSize}
                />
                : stopReasons !== undefined
                    ? <CaseScanPage
                        selectedWo={selectedWo}
                        palletNumber={selectedPalletNumber}
                        resetPalletNumber={() => setSelectedPalletNumber(undefined)}
                        stopWork={() => { setSelectedPalletNumber(undefined); setSelectedWo(undefined) }}
                        defaultCartonQty={defaultCartonQty}
                        setDefaultCartonQty={setDefaultCartonQty}
                        stopReasons={stopReasons}
                        loading={loading}
                        setLoading={setLoading}
                    />
                    : <></>
}

export default HillmanPage