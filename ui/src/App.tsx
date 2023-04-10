import React, { Component } from 'react'
import './App.scss'
import CacheBuster from 'react-cache-buster';
import { version } from '../package.json';
import UsersApiService from './services/UsersApiService';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
class App extends Component<any, {}> {

  state: { isLoggedIn: boolean }

  constructor(props: any) {
    super(props)

    this.state = {
      isLoggedIn: UsersApiService.isUserLoggedIn()
    }

    this.onLogin = this.onLogin.bind(this)
    this.onLogout = this.onLogout.bind(this)

    UsersApiService.addLogoutHandler(this.onLogout)
  }

  componentWillUnmount() {
    UsersApiService.removeLogoutHandler(this.onLogout)
  }

  onLogin() {
    this.setState({
      isLoggedIn: UsersApiService.isUserLoggedIn()
    })
  }

  onLogout() {
    this.setState({
      isLoggedIn: false
    })
  }

  render() {
    const isProduction = process.env.NODE_ENV === 'production';
    const userInfo = UsersApiService.getUserInfoCookie(false)

    return (
      <CacheBuster
        currentVersion={version}
        isEnabled={isProduction} //If false, the library is disabled.
        isVerboseMode={false} //If true, the library writes verbose logs to console.
      >
        {this.state.isLoggedIn === false || userInfo === null
          ? <LoginPage onLogin={this.onLogin} />
          : <MainPage userInfo={userInfo} />
        }
      </CacheBuster>
    )
  }
}

export default App
