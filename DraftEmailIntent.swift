import Foundation
import AppIntents

struct PendingEmailDraft: Codable {
    let recipient: String
    let subject: String
    let body: String
    let createdAt: Date
}

enum PendingDraftStore {
    private static let key = "eva.pendingEmailDraft"

    static func save(recipient: String, subject: String, body: String) {
        let draft = PendingEmailDraft(
            recipient: recipient,
            subject: subject,
            body: body,
            createdAt: Date()
        )

        if let data = try? JSONEncoder().encode(draft) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    static func load() -> PendingEmailDraft? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(PendingEmailDraft.self, from: data)
    }

    static func clear() {
        UserDefaults.standard.removeObject(forKey: key)
    }
}

struct DraftEmailIntent: AppIntent {
    static var title: LocalizedStringResource = "Prepare Email Draft"
    static var description = IntentDescription("Stores an email draft for EVA to review or open in Mail.")

    @Parameter(title: "Recipient")
    var recipient: String

    @Parameter(title: "Subject")
    var subject: String

    @Parameter(title: "Body")
    var body: String

    func perform() async throws -> some IntentResult & ProvidesDialog {
        PendingDraftStore.save(
            recipient: recipient,
            subject: subject,
            body: body
        )

        return .result(dialog: IntentDialog("Draft prepared for \(recipient)."))
    }
}

struct EVAAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        [
            AppShortcut(
                intent: DraftEmailIntent(),
                phrases: [
                    "Prepare an email in \(.applicationName)",
                    "Draft email with \(.applicationName)"
                ],
                shortTitle: "Draft Email",
                systemImageName: "envelope"
            )
        ]
    }
}