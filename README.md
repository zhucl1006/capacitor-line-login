# capacitor-line-login

login plug in

## Install

```bash
npm install capacitor-line-login
npx cap sync
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`login(...)`](#login)
* [`getUserProfile()`](#getuserprofile)
* [`isLoggedIn()`](#isloggedin)
* [`logout()`](#logout)
* [`refreshToken()`](#refreshtoken)
* [`echo(...)`](#echo)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: LineLoginConfig) => Promise<void>
```

初始化Line Login SDK

| Param         | Type                                                        | Description |
| ------------- | ----------------------------------------------------------- | ----------- |
| **`options`** | <code><a href="#lineloginconfig">LineLoginConfig</a></code> | 配置选项        |

--------------------


### login(...)

```typescript
login(options?: LoginOptions | undefined) => Promise<LoginResult>
```

执行Line登录

| Param         | Type                                                  | Description |
| ------------- | ----------------------------------------------------- | ----------- |
| **`options`** | <code><a href="#loginoptions">LoginOptions</a></code> | 登录选项        |

**Returns:** <code>Promise&lt;<a href="#loginresult">LoginResult</a>&gt;</code>

--------------------


### getUserProfile()

```typescript
getUserProfile() => Promise<UserProfile>
```

获取用户信息

**Returns:** <code>Promise&lt;<a href="#userprofile">UserProfile</a>&gt;</code>

--------------------


### isLoggedIn()

```typescript
isLoggedIn() => Promise<{ isLoggedIn: boolean; }>
```

检查登录状态

**Returns:** <code>Promise&lt;{ isLoggedIn: boolean; }&gt;</code>

--------------------


### logout()

```typescript
logout() => Promise<void>
```

登出

--------------------


### refreshToken()

```typescript
refreshToken() => Promise<TokenResult>
```

刷新访问令牌

**Returns:** <code>Promise&lt;<a href="#tokenresult">TokenResult</a>&gt;</code>

--------------------


### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

Echo方法（测试用）

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### Interfaces


#### LineLoginConfig

Line Login 配置接口

| Prop                   | Type                 | Description              |
| ---------------------- | -------------------- | ------------------------ |
| **`channelId`**        | <code>string</code>  | Line Channel ID          |
| **`universalLinkURL`** | <code>string</code>  | Universal Link URL (iOS) |
| **`debug`**            | <code>boolean</code> | 调试模式                     |


#### LoginResult

登录结果接口

| Prop               | Type                                                | Description |
| ------------------ | --------------------------------------------------- | ----------- |
| **`accessToken`**  | <code>string</code>                                 | 访问令牌        |
| **`expiresIn`**    | <code>number</code>                                 | 令牌过期时间（秒）   |
| **`refreshToken`** | <code>string</code>                                 | 刷新令牌        |
| **`scope`**        | <code>string</code>                                 | 权限范围        |
| **`tokenType`**    | <code>string</code>                                 | 令牌类型        |
| **`userProfile`**  | <code><a href="#userprofile">UserProfile</a></code> | 用户个人资料      |


#### UserProfile

用户个人资料接口

| Prop                | Type                | Description |
| ------------------- | ------------------- | ----------- |
| **`userId`**        | <code>string</code> | 用户ID        |
| **`displayName`**   | <code>string</code> | 显示名称        |
| **`pictureUrl`**    | <code>string</code> | 头像URL       |
| **`statusMessage`** | <code>string</code> | 状态消息        |
| **`language`**      | <code>string</code> | 语言          |


#### LoginOptions

登录选项接口

| Prop               | Type                                  | Description |
| ------------------ | ------------------------------------- | ----------- |
| **`onlyWebLogin`** | <code>boolean</code>                  | 仅使用Web登录    |
| **`botPrompt`**    | <code>'normal' \| 'aggressive'</code> | Bot提示模式     |
| **`scopes`**       | <code>string[]</code>                 | 权限范围        |


#### TokenResult

令牌结果接口

| Prop               | Type                | Description |
| ------------------ | ------------------- | ----------- |
| **`accessToken`**  | <code>string</code> | 访问令牌        |
| **`expiresIn`**    | <code>number</code> | 令牌过期时间（秒）   |
| **`refreshToken`** | <code>string</code> | 刷新令牌        |
| **`tokenType`**    | <code>string</code> | 令牌类型        |

</docgen-api>
