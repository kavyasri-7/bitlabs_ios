import Foundation
import Observation

@Observable
final class GalleryViewModel {
    var selectedFilter: GalleryFilter = .all
    var selectedStyle: ImageStyle = .rounded
    var searchText: String = ""

    private(set) var items: [GalleryItem] = []

    init() {
        items = Self.makeSampleItems()
    }

    var filteredItems: [GalleryItem] {
        items
            .filter { item in
                switch selectedFilter {
                case .all: return true
                case .local: return item.isLocal
                case .remote: return !item.isLocal
                }
            }
            .filter { item in
                guard !searchText.isEmpty else { return true }
                let query = searchText.lowercased()
                return item.title.lowercased().contains(query)
                    || item.subtitle.lowercased().contains(query)
            }
            .map { item in
                GalleryItem(
                    id: item.id,
                    title: item.title,
                    subtitle: item.subtitle,
                    source: item.source,
                    style: selectedStyle,
                    isLocal: item.isLocal
                )
            }
    }

    var localCount: Int {
        items.filter(\.isLocal).count
    }

    var remoteCount: Int {
        items.filter { !$0.isLocal }.count
    }

    private static func makeSampleItems() -> [GalleryItem] {
        let localItems: [GalleryItem] = [
            GalleryItem(
                title: "Mountain Vista",
                subtitle: "Bundled asset catalog image",
                source: .local(assetName: "local_mountain"),
                style: .rounded,
                isLocal: true
            ),
            GalleryItem(
                title: "Ocean Horizon",
                subtitle: "Stored locally on device",
                source: .local(assetName: "local_ocean"),
                style: .shadowed,
                isLocal: true
            ),
            GalleryItem(
                title: "Forest Trail",
                subtitle: "Offline-ready gallery photo",
                source: .local(assetName: "local_forest"),
                style: .bordered,
                isLocal: true
            ),
            GalleryItem(
                title: "Golden Sunset",
                subtitle: "Local image resource",
                source: .local(assetName: "local_sunset"),
                style: .circle,
                isLocal: true
            ),
        ]

        let remoteItems: [GalleryItem] = (1...12).map { index in
            let width = 400 + (index * 20)
            let height = 300 + (index * 15)
            let url = URL(string: "https://picsum.photos/id/\(index + 10)/\(width)/\(height)")!
            let styles: [ImageStyle] = [.rounded, .circle, .bordered, .shadowed]
            return GalleryItem(
                title: "Remote Photo \(index)",
                subtitle: "Loaded from picsum.photos",
                source: .remote(url: url),
                style: styles[index % styles.count],
                isLocal: false
            )
        }

        return localItems + remoteItems
    }
}
