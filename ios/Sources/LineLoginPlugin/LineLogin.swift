import Foundation
import LineSDK

@objc public class LineLogin: NSObject {
    
    private var channelId: String?
    
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
    
    @objc public func initialize(channelId: String) {
        self.channelId = channelId
        // Setup LineSDK with channel ID
        LoginManager.shared.setup(channelID: channelId, universalLinkURL: nil)
    }
    
    @objc public func login(completion: @escaping (Bool, [String: Any]?, String?) -> Void) {
        guard channelId != nil else {
            completion(false, nil, "Channel ID not set")
            return
        }
        
        // Set up login permissions
        let permissions: Set<LoginPermission> = [.profile]
        
        // Get the root view controller properly
        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let window = windowScene.windows.first,
                  let rootViewController = window.rootViewController else {
                completion(false, nil, "Unable to get root view controller")
                return
            }
            
            // Find the top-most view controller
            var topViewController = rootViewController
            while let presentedViewController = topViewController.presentedViewController {
                topViewController = presentedViewController
            }
            
            LoginManager.shared.login(permissions: permissions, in: topViewController) { result in
                DispatchQueue.main.async {
                    switch result {
                    case .success(let loginResult):
                        var resultDict: [String: Any] = [
                            "success": true,
                            "accessToken": loginResult.accessToken.value
                        ]
                        
                        // Add user profile if available
                        if let profile = loginResult.userProfile {
                            var profileDict: [String: Any] = [
                                "userId": profile.userID,
                                "displayName": profile.displayName
                            ]
                            
                            if let statusMessage = profile.statusMessage {
                                profileDict["statusMessage"] = statusMessage
                            }
                            
                            if let pictureURL = profile.pictureURL {
                                profileDict["pictureUrl"] = pictureURL.absoluteString
                            }
                            
                            resultDict["userProfile"] = profileDict
                        }
                        
                        completion(true, resultDict, nil)
                        
                    case .failure(let error):
                        completion(false, nil, error.localizedDescription)
                    }
                }
            }
        }
    }
    
    @objc public func logout(completion: @escaping (Bool, String?) -> Void) {
        LoginManager.shared.logout { result in
            switch result {
            case .success:
                completion(true, nil)
            case .failure(let error):
                completion(false, error.localizedDescription)
            }
        }
    }
    
    @objc public func isLoggedIn() -> Bool {
        return AccessTokenStore.shared.current != nil
    }
    
    @objc public func getUserProfile(completion: @escaping (Bool, [String: Any]?, String?) -> Void) {
        guard AccessTokenStore.shared.current != nil else {
            completion(false, nil, "User not logged in")
            return
        }
        
        API.getProfile { result in
            switch result {
            case .success(let profile):
                var profileDict: [String: Any] = [
                    "userId": profile.userID,
                    "displayName": profile.displayName
                ]
                
                if let statusMessage = profile.statusMessage {
                    profileDict["statusMessage"] = statusMessage
                }
                
                if let pictureURL = profile.pictureURL {
                    profileDict["pictureUrl"] = pictureURL.absoluteString
                }
                
                completion(true, profileDict, nil)
                
            case .failure(let error):
                completion(false, nil, error.localizedDescription)
            }
        }
    }
    
    @objc public func refreshToken(completion: @escaping (Bool, String?, String?) -> Void) {
        // Token refresh not implemented - user should re-login
        completion(false, nil, "Token refresh not implemented - please re-login")
    }
}
