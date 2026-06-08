import SwiftUI

struct GalleryImageStyleModifier: ViewModifier {
    let style: ImageStyle

    func body(content: Content) -> some View {
        switch style {
        case .rounded:
            content
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        case .circle:
            content
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .strokeBorder(Color.accentColor.opacity(0.35), lineWidth: 2)
                )
        case .bordered:
            content
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(Color.primary.opacity(0.2), lineWidth: 2)
                )
        case .shadowed:
            content
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: .black.opacity(0.18), radius: 8, x: 0, y: 4)
        }
    }
}

extension View {
    func galleryImageStyle(_ style: ImageStyle) -> some View {
        modifier(GalleryImageStyleModifier(style: style))
    }
}
