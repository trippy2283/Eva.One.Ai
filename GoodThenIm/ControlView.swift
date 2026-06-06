import SwiftUI

struct ControlView: View {
    @EnvironmentObject var state: AppStateManager

    var body: some View {
        List {
            Section("System State") {
                HStack {
                    Label(
                        state.isActive ? "Active" : "Locked",
                        systemImage: state.isActive ? "bolt.shield.fill" : "lock.shield.fill"
                    )
                    Spacer()
                    Text(state.currentMode.displayName)
                        .foregroundStyle(.secondary)
                }

                Toggle("EVA Active", isOn: Binding(
                    get: { state.isActive },
                    set: { isOn in
                        if isOn {
                            Task {
                                await state.requestReactivation(into: .observe)
                            }
                        } else {
                            state.deactivate()
                        }
                    }
                ))
                .tint(state.isActive ? .green : .red)

                Picker("Mode", selection: Binding(
                    get: { state.currentMode },
                    set: { state.setMode($0) }
                )) {
                    ForEach(EVAMode.allCases.filter { $0 != .sleep }) { mode in
                        Text(mode.displayName).tag(mode)
                    }
                }
                .disabled(!state.isActive)
            }

            Section("Permissions") {
                Toggle("Web Access (Session Only)", isOn: Binding(
                    get: { state.isWebEnabled },
                    set: { enabled in
                        if enabled {
                            state.enableWebAccess(for: 15)
                        } else {
                            state.disableWebAccess()
                        }
                    }
                ))
                .disabled(!state.isActive)

                if let expiry = state.webAccessExpiresAt {
                    Text("Expires: \(expiry.formatted(date: .abbreviated, time: .shortened))")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }

            Section("Security") {
                Button("Reactivate EVA") {
                    Task {
                        await state.requestReactivation(into: .observe)
                    }
                }
                .disabled(state.isActive)

                Button("Force Reset & Lock", role: .destructive) {
                    state.deactivate()
                }
            }

            if let event = state.lastSecurityEvent {
                Section("Last Security Event") {
                    Text(event)
                }
            }

            if let error = state.lastError {
                Section("Last Error") {
                    Text(error)
                        .foregroundStyle(.red)
                }
            }
        }
        .navigationTitle("Control")
    }
}