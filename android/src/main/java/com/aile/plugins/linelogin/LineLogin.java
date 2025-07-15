package com.aile.plugins.linelogin;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import com.getcapacitor.Logger;
import com.getcapacitor.JSObject;
import com.linecorp.linesdk.api.LineApiClient;
import com.linecorp.linesdk.api.LineApiClientBuilder;
import com.linecorp.linesdk.LineApiResponse;
import com.linecorp.linesdk.LineProfile;
import com.linecorp.linesdk.LineCredential;

public class LineLogin {

    private static final String PREF_NAME = "LineLoginPrefs";
    private static final String PREF_CHANNEL_ID = "channelId";
    private static final String PREF_ACCESS_TOKEN = "accessToken";
    private static final String PREF_IS_LOGGED_IN = "isLoggedIn";
    
    private Context context;
    private String channelId;
    private LineApiClient lineApiClient;
    private SharedPreferences prefs;

    public interface ProfileCallback {
        void onSuccess(JSObject profile);
        void onError(String error);
    }

    public interface TokenCallback {
        void onSuccess(String token);
        void onError(String error);
    }

    public void initialize(Context context) {
        this.context = context;
        this.prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        
        // Restore channel ID if available
        String savedChannelId = prefs.getString(PREF_CHANNEL_ID, null);
        if (savedChannelId != null) {
            setChannelId(savedChannelId);
        }
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
        
        // Save channel ID
        prefs.edit().putString(PREF_CHANNEL_ID, channelId).apply();
        
        // Initialize LineApiClient
        if (context != null) {
            LineApiClientBuilder apiClientBuilder = new LineApiClientBuilder(context, channelId);
            lineApiClient = apiClientBuilder.build();
        }
    }

    public String getChannelId() {
        return channelId;
    }

    public void logout() {
        // Clear stored data
        prefs.edit()
            .remove(PREF_ACCESS_TOKEN)
            .putBoolean(PREF_IS_LOGGED_IN, false)
            .apply();
        
        // Call Line SDK logout if available
        if (lineApiClient != null) {
            new AsyncTask<Void, Void, Void>() {
                @Override
                protected Void doInBackground(Void... params) {
                    try {
                        lineApiClient.logout();
                    } catch (Exception e) {
                        Logger.error("LineLogin: Logout error: " + e.getMessage());
                    }
                    return null;
                }
            }.execute();
        }
    }

    public boolean isLoggedIn() {
        return prefs.getBoolean(PREF_IS_LOGGED_IN, false);
    }

    public void setLoggedIn(boolean loggedIn, String accessToken) {
        prefs.edit()
            .putBoolean(PREF_IS_LOGGED_IN, loggedIn)
            .putString(PREF_ACCESS_TOKEN, accessToken)
            .apply();
    }

    public void getUserProfile(ProfileCallback callback) {
        if (lineApiClient == null) {
            callback.onError("Line API client not initialized");
            return;
        }

        new AsyncTask<Void, Void, LineApiResponse<LineProfile>>() {
            @Override
            protected LineApiResponse<LineProfile> doInBackground(Void... params) {
                try {
                    return lineApiClient.getProfile();
                } catch (Exception e) {
                    Logger.error("LineLogin: Get profile error: " + e.getMessage());
                    return null;
                }
            }

            @Override
            protected void onPostExecute(LineApiResponse<LineProfile> response) {
                if (response != null && response.isSuccess()) {
                    LineProfile profile = response.getResponseData();
                    
                    JSObject profileObj = new JSObject();
                    profileObj.put("userId", profile.getUserId());
                    profileObj.put("displayName", profile.getDisplayName());
                    profileObj.put("statusMessage", profile.getStatusMessage());
                    if (profile.getPictureUrl() != null) {
                        profileObj.put("pictureUrl", profile.getPictureUrl().toString());
                    }
                    
                    callback.onSuccess(profileObj);
                } else {
                    String error = response != null ? response.getErrorData().toString() : "Unknown error";
                    callback.onError("Failed to get profile: " + error);
                }
            }
        }.execute();
    }

    public void refreshToken(TokenCallback callback) {
        // Token refresh not implemented - user should re-login
        callback.onError("Token refresh not implemented - please re-login");
    }

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }
}
