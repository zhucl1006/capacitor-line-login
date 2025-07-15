import { LineLogin, LineLoginHelpers } from 'capacitor-line-login';

// 全局状态管理
let isInitialized = false;
let currentUser = null;

// 初始化函数
window.initializeLineLogin = async () => {
    try {
        const channelId = document.getElementById('channelIdInput').value;
        if (!channelId) {
            showResult('请输入Channel ID');
            return;
        }

        const config = {
            channelId: channelId,
            scope: ['profile']
        };

        // 如果是Web平台，添加重定向URI
        if (LineLoginHelpers.isWebPlatform()) {
            config.redirectUri = window.location.origin + '/line-callback';
        }

        await LineLogin.initialize(config);
        isInitialized = true;
        showResult('初始化成功！平台：' + LineLoginHelpers.getCurrentPlatform());
        updateUI();
    } catch (error) {
        showResult('初始化失败：' + error.message);
    }
};

// 登录函数
window.loginWithLine = async () => {
    if (!isInitialized) {
        showResult('请先初始化插件');
        return;
    }

    try {
        showResult('正在登录...');
        const result = await LineLogin.login();
        
        currentUser = result.userProfile;
        showResult('登录成功！用户：' + currentUser.displayName);
        showUserInfo(result);
        updateUI();
    } catch (error) {
        showResult('登录失败：' + error.message);
    }
};

// 获取用户信息函数
window.getUserProfile = async () => {
    if (!isInitialized) {
        showResult('请先初始化插件');
        return;
    }

    try {
        const profile = await LineLogin.getUserProfile();
        currentUser = profile;
        showResult('获取用户信息成功');
        showUserInfo({ userProfile: profile });
    } catch (error) {
        showResult('获取用户信息失败：' + error.message);
    }
};

// 检查登录状态函数
window.checkLoginStatus = async () => {
    if (!isInitialized) {
        showResult('请先初始化插件');
        return;
    }

    try {
        const result = await LineLogin.isLoggedIn();
        showResult('登录状态：' + (result.isLoggedIn ? '已登录' : '未登录'));
    } catch (error) {
        showResult('检查登录状态失败：' + error.message);
    }
};

// 登出函数
window.logoutFromLine = async () => {
    if (!isInitialized) {
        showResult('请先初始化插件');
        return;
    }

    try {
        await LineLogin.logout();
        currentUser = null;
        showResult('登出成功');
        updateUI();
    } catch (error) {
        showResult('登出失败：' + error.message);
    }
};

// 刷新令牌函数
window.refreshAccessToken = async () => {
    if (!isInitialized) {
        showResult('请先初始化插件');
        return;
    }

    try {
        const result = await LineLogin.refreshToken();
        showResult('令牌刷新成功：' + result.accessToken.substring(0, 10) + '...');
    } catch (error) {
        showResult('令牌刷新失败：' + error.message);
    }
};

// Echo测试函数
window.testEcho = async () => {
    const inputValue = document.getElementById("echoInput").value;
    try {
        const result = await LineLogin.echo({ value: inputValue });
        showResult('Echo结果：' + result.value);
    } catch (error) {
        showResult('Echo失败：' + error.message);
    }
};

// 显示结果函数
function showResult(message) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        const timestamp = new Date().toLocaleTimeString();
        resultDiv.innerHTML = `<div>[${timestamp}] ${message}</div>` + resultDiv.innerHTML;
    } else {
        console.log(message);
    }
}

// 显示用户信息函数
function showUserInfo(loginResult) {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv && loginResult.userProfile) {
        const user = loginResult.userProfile;
        userInfoDiv.innerHTML = `
            <h3>用户信息</h3>
            <p><strong>用户ID:</strong> ${user.userId}</p>
            <p><strong>显示名称:</strong> ${user.displayName}</p>
            <p><strong>状态消息:</strong> ${user.statusMessage || '无'}</p>
            <p><strong>语言:</strong> ${user.language || '未知'}</p>
            ${user.pictureUrl ? `<p><img src="${user.pictureUrl}" alt="头像" style="width: 50px; height: 50px; border-radius: 50%;"></p>` : ''}
            ${loginResult.accessToken ? `<p><strong>访问令牌:</strong> ${loginResult.accessToken.substring(0, 20)}...</p>` : ''}
        `;
    }
}

// 更新UI状态函数
function updateUI() {
    const initButton = document.getElementById('initButton');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const userActions = document.getElementById('userActions');

    if (initButton) initButton.disabled = isInitialized;
    if (loginButton) loginButton.disabled = !isInitialized || currentUser !== null;
    if (logoutButton) logoutButton.disabled = !isInitialized || currentUser === null;
    if (userActions) userActions.style.display = currentUser ? 'block' : 'none';
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    showResult('页面加载完成，当前平台：' + LineLoginHelpers.getCurrentPlatform());
    showResult('平台支持状态：' + (LineLoginHelpers.isPlatformSupported() ? '支持' : '不支持'));
    updateUI();
    
    // 如果是Web平台且URL包含授权码，处理回调
    if (LineLoginHelpers.isWebPlatform() && window.location.search.includes('code=')) {
        showResult('检测到登录回调，正在处理...');
        // 这里Web实现会自动处理回调
    }
});
