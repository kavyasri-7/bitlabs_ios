import Foundation

enum ImageSource: Equatable, Hashable {
    case local(assetName: String)
    case remote(url: URL)
}

enum ImageStyle: String, CaseIterable, Identifiable {
    case rounded
    case circle
    case bordered
    case shadowed

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .rounded: return "Rounded"
        case .circle: return "Circle"
        case .bordered: return "Bordered"
        case .shadowed: return "Shadowed"
        }
    }
}

struct GalleryItem: Identifiable, Hashable {
    let id: UUID
    let title: String
    let subtitle: String
    let source: ImageSource
    let style: ImageStyle
    let isLocal: Bool

    init(
        id: UUID = UUID(),
        title: String,
        subtitle: String,
        source: ImageSource,
        style: ImageStyle,
        isLocal: Bool
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.source = source
        self.style = style
        self.isLocal = isLocal
    }
}

enum GalleryFilter: String, CaseIterable, Identifiable {
    case all
    case local
    case remote

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .all: return "All"
        case .local: return "Local"
        case .remote: return "Remote"
        }
    }
}
