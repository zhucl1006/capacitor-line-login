import Foundation
import Capacitor
import LineSDK

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(LineLoginPlugin)
public class LineLoginPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LineLoginPlugin"
    public let jsName = "LineLogin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "login", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isLoggedIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getUserProfile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "refreshToken", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = LineLogin()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }
    
    @objc func initialize(_ call: CAPPluginCall) {
        guard let channelId = call.getString("channelId") else {
            call.reject("Channel ID is required")
            return
        }
        
        implementation.initialize(channelId: channelId)
        call.resolve(["success": true])
    }
    
    @objc func login(_ call: CAPPluginCall) {
        implementation.login { success, result, error in
            if success, let result = result {
                call.resolve(result)
            } else {
                call.reject(error ?? "Login failed")
            }
        }
    }
    
    @objc func logout(_ call: CAPPluginCall) {
        implementation.logout { success, error in
            if success {
                call.resolve(["success": true])
            } else {
                call.reject(error ?? "Logout failed")
            }
        }
    }
    
    @objc func isLoggedIn(_ call: CAPPluginCall) {
        let isLoggedIn = implementation.isLoggedIn()
        call.resolve(["isLoggedIn": isLoggedIn])
    }
    
    @objc func getUserProfile(_ call: CAPPluginCall) {
        implementation.getUserProfile { success, profile, error in
            if success, let profile = profile {
                call.resolve(profile)
            } else {
                call.reject(error ?? "Failed to get user profile")
            }
        }
    }
    
    @objc func refreshToken(_ call: CAPPluginCall) {
        implementation.refreshToken { success, token, error in
            if success, let token = token {
                call.resolve(["accessToken": token])
            } else {
                call.reject(error ?? "Token refresh failed")
            }
        }
    }
}
