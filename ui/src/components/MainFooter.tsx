import { Footer } from "antd/lib/layout/layout"
import React, { FunctionComponent } from "react"

const MainFooter : FunctionComponent = props => {
    return <Footer style={{ textAlign: 'center' }}>
    Peter Gaietto &amp; Associates, Inc. ©2018-{(new Date().getFullYear())}
    <br />All rights reserved
  </Footer>
}

export default MainFooter
