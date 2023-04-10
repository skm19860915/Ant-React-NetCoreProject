import React, { FunctionComponent } from "react"
import { Link } from "react-router-dom"
import logo from '../images/logo.png'

const HomeLogoButton: FunctionComponent = props => {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <Link to="/" component={() => <a href=""><img src={logo} alt="logo" height={50} /></a>} />
}

export default HomeLogoButton