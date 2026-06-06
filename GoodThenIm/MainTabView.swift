import SwiftUI

struct MainTabView: View {
    @StateObject private var state = AppStateManager()

    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
            }
            .tabItem { Label("Home", systemImage: "house.fill") }

            NavigationStack {
                ChatView()
            }
            .tabItem { Label("Chat", systemImage: "bubble.left.and.bubble.right.fill") }

            NavigationStack {
                WorkflowView()
            }
            .tabItem { Label("Workflows", systemImage: "square.stack.3d.up.fill") }

            NavigationStack {
                InboxView()
            }
            .tabItem { Label("Inbox", systemImage: "tray.full.fill") }

            NavigationStack {
                ControlView()
            }
            .tabItem { Label("Control", systemImage: "gearshape.shield.fill") }
        }
        .environmentObject(state)
    }
}