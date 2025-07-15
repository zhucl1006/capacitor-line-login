package com.aile.plugins.linelogin;

import android.content.Intent;
import android.app.Activity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import com.linecorp.linesdk.auth.LineLoginApi;
import com.linecorp.linesdk.auth.LineLoginResult;
import com.linecorp.linesdk.auth.LineAuthenticationParams;
import com.linecorp.linesdk.Scope;
import java.util.Arrays;

@CapacitorPlugin(name = "LineLogin")
public class LineLoginPlugin extends Plugin {

    private LineLogin implementation = new LineLogin();
    private static final int REQUEST_CODE_LINE_LOGIN = 1;

    @Override
    public void load() {
        super.load();
        // Initialize the implementation with context
        implementation.initialize(getContext());
    }

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", implementation.echo(value));
        call.resolve(ret);
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        String channelId = call.getString("channelId");
        
        if (channelId == null || channelId.isEmpty()) {
            call.reject("Channel ID is required");
            return;
        }
        
        implementation.setChannelId(channelId);
        
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void login(PluginCall call) {
        try {
            // Get login intent from LineLoginApi
            Intent loginIntent = LineLoginApi.getLoginIntent(
                getContext(),
                implementation.getChannelId(),
                new LineAuthenticationParams.Builder()
                    .scopes(Arrays.asList(Scope.PROFILE))
                    .build()
            );
            
            // Start activity for result
            startActivityForResult(call, loginIntent, "handleLoginResult");
            
        } catch (Exception e) {
            call.reject("Login failed: " + e.getMessage());
        }
    }

    @ActivityCallback
    private void handleLoginResult(PluginCall call, Intent data) {
        if (data == null) {
            call.reject("Login cancelled");
            return;
        }

        LineLoginResult result = LineLoginApi.getLoginResultFromIntent(data);
        
        switch (result.getResponseCode()) {
            case SUCCESS:
                String accessToken = result.getLineCredential().getAccessToken().getTokenString();
                
                // Save login state
                implementation.setLoggedIn(true, accessToken);
                
                JSObject loginResult = new JSObject();
                loginResult.put("success", true);
                loginResult.put("accessToken", accessToken);
                
                // Add user profile if available
                if (result.getLineProfile() != null) {
                    JSObject profile = new JSObject();
                    profile.put("userId", result.getLineProfile().getUserId());
                    profile.put("displayName", result.getLineProfile().getDisplayName());
                    profile.put("statusMessage", result.getLineProfile().getStatusMessage());
                    if (result.getLineProfile().getPictureUrl() != null) {
                        profile.put("pictureUrl", result.getLineProfile().getPictureUrl().toString());
                    }
                    loginResult.put("profile", profile);
                }
                
                call.resolve(loginResult);
                break;
                
            case CANCEL:
                call.reject("Login cancelled by user");
                break;
                
            default:
                call.reject("Login failed: " + result.getErrorData().toString());
                break;
        }
    }

    @PluginMethod
    public void logout(PluginCall call) {
        implementation.logout();
        
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void isLoggedIn(PluginCall call) {
        boolean isLoggedIn = implementation.isLoggedIn();
        
        JSObject ret = new JSObject();
        ret.put("isLoggedIn", isLoggedIn);
        call.resolve(ret);
    }

    @PluginMethod
    public void getUserProfile(PluginCall call) {
        implementation.getUserProfile(new LineLogin.ProfileCallback() {
            @Override
            public void onSuccess(JSObject profile) {
                call.resolve(profile);
            }
            
            @Override
            public void onError(String error) {
                call.reject(error);
            }
        });
    }

    @PluginMethod
    public void refreshToken(PluginCall call) {
        implementation.refreshToken(new LineLogin.TokenCallback() {
            @Override
            public void onSuccess(String token) {
                JSObject ret = new JSObject();
                ret.put("accessToken", token);
                call.resolve(ret);
            }
            
            @Override
            public void onError(String error) {
                call.reject(error);
            }
        });
    }
}
