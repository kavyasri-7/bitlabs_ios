import SwiftUI

enum GridLayoutCalculator {
    /// Returns an adaptive grid that responds to available width.
    static func adaptiveColumns(
        minimumWidth: CGFloat = 150,
        maximumWidth: CGFloat = 220,
        spacing: CGFloat = 16
    ) -> [GridItem] {
        [
            GridItem(
                .adaptive(minimum: minimumWidth, maximum: maximumWidth),
                spacing: spacing,
                alignment: .top
            )
        ]
    }

    /// Tighter grid for compact width (e.g. iPhone portrait).
    static var compactColumns: [GridItem] {
        adaptiveColumns(minimumWidth: 140, maximumWidth: 180, spacing: 12)
    }

    /// Wider grid for regular width (e.g. iPad or landscape).
    static var regularColumns: [GridItem] {
        adaptiveColumns(minimumWidth: 180, maximumWidth: 260, spacing: 20)
    }

    static func columns(for horizontalSizeClass: UserInterfaceSizeClass?) -> [GridItem] {
        horizontalSizeClass == .regular ? regularColumns : compactColumns
    }
}
