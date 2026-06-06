import SwiftUI
import LocalAuthentication

@MainActor
final class AppStateManager: ObservableObject {
    @Published private(set) var currentMode: EVAMode = .sleep
    @Published private(set) var isHardLocked: Bool = true
    @Published private(set) var isWebEnabled: Bool = false
    @Published private(set) var webAccessExpiresAt: Date?
    @Published var lastError: String?
    @Published var lastSecurityEvent: String?
    @Published var sessionNotes: [String] = []

    private var webExpiryTask: Task<Void, Never>?

    var isActive: Bool {
        !isHardLocked && currentMode != .sleep
    }

    func deactivate(clearSessionMemory: Bool = true) {
        currentMode = .sleep
        isHardLocked = true
        disableWebAccess()

        if clearSessionMemory {
            sessionNotes.removeAll()
        }

        lastSecurityEvent = "EVA locked and returned to Sleep."
    }

    func requestReactivation(into mode: EVAMode = .observe) async {
        do {
            let success = try await authenticateUser(reason: "Reactivate EVA")
            guard success else {
                lastError = "Authentication was cancelled."
                return
            }

            isHardLocked = false
            currentMode = mode
            lastError = nil
            lastSecurityEvent = "EVA reactivated in \(mode.displayName) mode."
        } catch {
            lastError = error.localizedDescription
        }
    }

    func setMode(_ newMode: EVAMode) {
        guard !isHardLocked else {
            lastError = "EVA is locked. Reactivate it first."
            return
        }

        currentMode = newMode
    }

    func enableWebAccess(for minutes: Int = 15) {
        guard isActive else {
            lastError = "Reactivate EVA before enabling web access."
            return
        }

        isWebEnabled = true
        webAccessExpiresAt = Date().addingTimeInterval(TimeInterval(minutes * 60))
        lastSecurityEvent = "Web access enabled for \(minutes) minutes."
        scheduleWebExpiry()
    }

    func disableWebAccess() {
        isWebEnabled = false
        webAccessExpiresAt = nil
        webExpiryTask?.cancel()
        webExpiryTask = nil
    }

    func addSessionNote(_ note: String) {
        guard !note.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        sessionNotes.append(note)
    }

    private func scheduleWebExpiry() {
        webExpiryTask?.cancel()

        guard let expiry = webAccessExpiresAt else { return }
        let delay = max(0, expiry.timeIntervalSinceNow)

        webExpiryTask = Task {
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))

            guard !Task.isCancelled else { return }

            await MainActor.run {
                self.isWebEnabled = false
                self.webAccessExpiresAt = nil
                self.lastSecurityEvent = "Web access session expired."
            }
        }
    }

    private func authenticateUser(reason: String) async throws -> Bool {
        let context = LAContext()
        context.localizedCancelTitle = "Cancel"

        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            throw AuthenticationError.unavailable(error?.localizedDescription ?? "Authentication unavailable.")
        }

        return try await withCheckedThrowingContinuation { continuation in
            context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { success, authError in
                if let authError {
                    continuation.resume(throwing: authError)
                } else {
                    continuation.resume(returning: success)
                }
            }
        }
    }
}

enum AuthenticationError: LocalizedError {
    case unavailable(String)

    var errorDescription: String? {
        switch self {
        case .unavailable(let message):
            return message
        }
    }
}