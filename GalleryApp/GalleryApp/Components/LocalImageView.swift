import SwiftUI

/// Displays images bundled in the asset catalog.
struct LocalImageView: View {
    let assetName: String

    var body: some View {
        Image(assetName)
            .resizable()
            .scaledToFill()
    }
}

#Preview {
    LocalImageView(assetName: "local_mountain")
        .frame(width: 160, height: 160)
        .galleryImageStyle(.rounded)
        .padding()
}
