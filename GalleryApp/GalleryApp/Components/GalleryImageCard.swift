import SwiftUI

struct GalleryImageCard: View {
    let item: GalleryItem

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            imageContent
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)
                .galleryImageStyle(item.style)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(item.title)
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)

                    Spacer(minLength: 4)

                    SourceBadge(isLocal: item.isLocal)
                }

                Text(item.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            .padding(.horizontal, 4)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color(.secondarySystemGroupedBackground))
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(item.title), \(item.isLocal ? "local" : "remote") image")
    }

    @ViewBuilder
    private var imageContent: some View {
        switch item.source {
        case .local(let assetName):
            LocalImageView(assetName: assetName)
        case .remote(let url):
            RemoteImageView(url: url)
        }
    }
}

private struct SourceBadge: View {
    let isLocal: Bool

    var body: some View {
        Label(
            isLocal ? "Local" : "Remote",
            systemImage: isLocal ? "internaldrive" : "icloud.and.arrow.down"
        )
        .font(.caption2.weight(.medium))
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill(isLocal ? Color.green.opacity(0.15) : Color.blue.opacity(0.15))
        )
        .foregroundStyle(isLocal ? .green : .blue)
        .labelStyle(.titleOnly)
    }
}

#Preview {
    GalleryImageCard(
        item: GalleryItem(
            title: "Preview",
            subtitle: "Sample gallery card",
            source: .local(assetName: "local_mountain"),
            style: .rounded,
            isLocal: true
        )
    )
    .frame(width: 200)
    .padding()
}
