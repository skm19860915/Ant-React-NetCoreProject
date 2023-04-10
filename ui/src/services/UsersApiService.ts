import { UserInformation } from "../data/PortalEntities"
import BaseApiService from "./BaseApiService"

const userInfoKey = "userInfo"
const userTokenKey = "token"

type LogoutHandler = () => void

export default class UsersApiService {

    static userInfo?: UserInformation = undefined

    static getUserInfoCookie(logoutIfNull: boolean = true) {
        const userInfo = sessionStorage.getItem(userInfoKey)
        if (userInfo === null) {
            if (logoutIfNull) {
                UsersApiService.logout()
            }
            return null
        } else
            return JSON.parse(userInfo) as UserInformation
    }

    static setUserInfoCookie(userInfo: UserInformation) {
        sessionStorage.setItem(userInfoKey, JSON.stringify(userInfo))
    }

    static getUserTokenCookie() {
        const userToken = sessionStorage.getItem(userTokenKey)
        if (userToken === undefined)
            return undefined
        else
            return userToken
    }

    static setUserTokenCookie(userToken: string) {
        sessionStorage.setItem(userTokenKey, userToken)
    }

    static isUserLoggedIn(): boolean {
        return UsersApiService.getUserInfoCookie() !== undefined
    }

    static async getUserInfo() {
        const response = await BaseApiService.apiGet<UserInformation>('/users/info')

        UsersApiService.setUserInfoCookie(response)
        return response
    }

    static async login(username: string, password: string) {
        const response = await BaseApiService.apiSendJSONAndGet<{ token: string, expiration: Date }>('/users/authenticate', 'POST', { username, password }, undefined, undefined, undefined, true)

        UsersApiService.setUserTokenCookie(response.token)

        const userInfo = await UsersApiService.getUserInfo()

        UsersApiService.setUserInfoCookie(userInfo)
    }

    static logout() {
        sessionStorage.removeItem(userInfoKey)
        sessionStorage.removeItem(userTokenKey)

        UsersApiService.logoutHandlers.forEach(handler => handler())
    }

    static logoutHandlers: LogoutHandler[] = []

    static addLogoutHandler(fn: LogoutHandler) {
        UsersApiService.logoutHandlers.push(fn)
    }

    static removeLogoutHandler(fn: LogoutHandler) {
        const index = UsersApiService.logoutHandlers.indexOf(fn)

        if (index > -1) {
            UsersApiService.logoutHandlers.splice(index, 1)
        }
    }
}