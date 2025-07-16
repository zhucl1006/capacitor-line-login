// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AileCapacitorLineLogin",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "AileCapacitorLineLogin",
            targets: ["LineLoginPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "6.0.0"),
        .package(url: "https://github.com/line/line-sdk-ios-swift.git", from: "5.8.0")
    ],
    targets: [
        .target(
            name: "LineLoginPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "LineSDK", package: "line-sdk-ios-swift")
            ],
            path: "ios/Sources/LineLoginPlugin"),
        .testTarget(
            name: "LineLoginPluginTests",
            dependencies: ["LineLoginPlugin"],
            path: "ios/Tests/LineLoginPluginTests")
    ]
)