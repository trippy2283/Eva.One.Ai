import Foundation
import SwiftData

enum EVAMode: String, Codable, CaseIterable, Identifiable {
    case sleep
    case observe
    case assist
    case execute

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .sleep: "Sleep"
        case .observe: "Observe"
        case .assist: "Assist"
        case .execute: "Execute"
        }
    }
}

enum MemoryCategory: String, Codable, CaseIterable, Identifiable {
    case preference = "Preference"
    case workflow = "Workflow"
    case forbiddenZone = "ForbiddenZone"
    case profile = "Profile"
    case project = "Project"

    var id: String { rawValue }
}

enum ActionStatus: String, Codable, CaseIterable, Identifiable {
    case executed = "Executed"
    case blocked = "Blocked"
    case pendingApproval = "PendingApproval"
    case drafted = "Drafted"
    case failed = "Failed"

    var id: String { rawValue }
}

enum ApprovalLevel: String, Codable, CaseIterable, Identifiable {
    case automatic = "Automatic"
    case confirmSensitive = "ConfirmSensitive"
    case confirmAll = "ConfirmAll"

    var id: String { rawValue }
}

@Model
final class MemoryItem {
    @Attribute(.unique) var id: UUID
    var timestamp: Date
    var content: String
    var category: MemoryCategory
    var isPinned: Bool
    var tags: [String]
    var source: String?

    init(
        content: String,
        category: MemoryCategory,
        isPinned: Bool = false,
        tags: [String] = [],
        source: String? = nil
    ) {
        self.id = UUID()
        self.timestamp = Date()
        self.content = content
        self.category = category
        self.isPinned = isPinned
        self.tags = tags
        self.source = source
    }
}

@Model
final class ActionLog {
    @Attribute(.unique) var id: UUID
    var timestamp: Date
    var actionDescription: String
    var status: ActionStatus
    var modeAtExecution: EVAMode
    var requiresApproval: Bool
    var errorMessage: String?

    init(
        description: String,
        status: ActionStatus,
        modeAtExecution: EVAMode,
        requiresApproval: Bool = false,
        errorMessage: String? = nil
    ) {
        self.id = UUID()
        self.timestamp = Date()
        self.actionDescription = description
        self.status = status
        self.modeAtExecution = modeAtExecution
        self.requiresApproval = requiresApproval
        self.errorMessage = errorMessage
    }
}

@Model
final class WorkflowPreset {
    @Attribute(.unique) var id: UUID
    var name: String
    var defaultMode: EVAMode
    var allowsWeb: Bool
    var approvalLevel: ApprovalLevel
    var responseStyle: String

    init(
        name: String,
        defaultMode: EVAMode,
        allowsWeb: Bool = false,
        approvalLevel: ApprovalLevel = .confirmSensitive,
        responseStyle: String = "Executive"
    ) {
        self.id = UUID()
        self.name = name
        self.defaultMode = defaultMode
        self.allowsWeb = allowsWeb
        self.approvalLevel = approvalLevel
        self.responseStyle = responseStyle
    }
}

@Model
final class AppSettings {
    @Attribute(.unique) var id: UUID
    var biometricReactivationRequired: Bool
    var webSessionMinutes: Int
    var approvalLevel: ApprovalLevel
    var hardLocked: Bool
    var voicePersonaName: String

    init(
        biometricReactivationRequired: Bool = true,
        webSessionMinutes: Int = 15,
        approvalLevel: ApprovalLevel = .confirmSensitive,
        hardLocked: Bool = true,
        voicePersonaName: String = "Eva"
    ) {
        self.id = UUID()
        self.biometricReactivationRequired = biometricReactivationRequired
        self.webSessionMinutes = webSessionMinutes
        self.approvalLevel = approvalLevel
        self.hardLocked = hardLocked
        self.voicePersonaName = voicePersonaName
    }
}