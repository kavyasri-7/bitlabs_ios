import SwiftUI

struct GalleryDetailView: View {
    let item: GalleryItem
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    detailImage
                        .frame(maxWidth: .infinity)
                        .aspectRatio(4 / 3, contentMode: .fit)
                        .galleryImageStyle(item.style)
                        .padding(.horizontal)

                    VStack(alignment: .leading, spacing: 12) {
                        Text(item.title)
                            .font(.title2.weight(.bold))

                        Text(item.subtitle)
                            .font(.body)
                            .foregroundStyle(.secondary)

                        Divider()

                        DetailRow(
                            title: "Source",
                            value: item.isLocal ? "Local Asset" : "Remote URL"
                        )

                        DetailRow(
                            title: "Style",
                            value: item.style.displayName
                        )

                        if case .remote(let url) = item.source {
                            DetailRow(title: "URL", value: url.absoluteString)
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Photo Detail")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var detailImage: some View {
        switch item.source {
        case .local(let assetName):
            LocalImageView(assetName: assetName)
        case .remote(let url):
            RemoteImageView(url: url)
        }
    }
}

private struct DetailRow: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            Text(value)
                .font(.subheadline)
                .textSelection(.enabled)
        }
    }
}

#Preview {
    GalleryDetailView(
        item: GalleryItem(
            title: "Mountain Vista",
            subtitle: "Bundled asset catalog image",
            source: .local(assetName: "local_mountain"),
            style: .rounded,
            isLocal: true
        )
    )
}
