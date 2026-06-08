import SwiftUI

/// Loads and displays remote images with loading and error states.
struct RemoteImageView: View {
    let url: URL

    var body: some View {
        AsyncImage(url: url, transaction: Transaction(animation: .easeInOut)) { phase in
            switch phase {
            case .empty:
                ZStack {
                    Color(.secondarySystemBackground)
                    ProgressView()
                        .controlSize(.regular)
                }
            case .success(let image):
                image
                    .resizable()
                    .scaledToFill()
                    .transition(.opacity.combined(with: .scale(scale: 0.98)))
            case .failure:
                ZStack {
                    Color(.secondarySystemBackground)
                    VStack(spacing: 8) {
                        Image(systemName: "photo.badge.exclamationmark")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                        Text("Failed to load")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            @unknown default:
                Color(.secondarySystemBackground)
            }
        }
    }
}

#Preview {
    RemoteImageView(url: URL(string: "https://picsum.photos/300/300")!)
        .frame(width: 160, height: 160)
        .galleryImageStyle(.rounded)
        .padding()
}
