// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorLineLogin",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorLineLogin",
            targets: ["LineLoginPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "LineLoginPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/LineLoginPlugin"),
        .testTarget(
            name: "LineLoginPluginTests",
            dependencies: ["LineLoginPlugin"],
            path: "ios/Tests/LineLoginPluginTests")
    ]
)