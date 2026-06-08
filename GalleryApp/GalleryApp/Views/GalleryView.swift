import SwiftUI

struct GalleryView: View {
    @State private var viewModel = GalleryViewModel()
    @State private var selectedItem: GalleryItem?
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    private var gridColumns: [GridItem] {
        GridLayoutCalculator.columns(for: horizontalSizeClass)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    statsHeader
                    filterPicker
                    stylePicker
                    galleryGrid
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Gallery")
            .searchable(text: $viewModel.searchText, prompt: "Search photos")
            .sheet(item: $selectedItem) { item in
                GalleryDetailView(item: item)
            }
        }
    }

    private var statsHeader: some View {
        HStack(spacing: 12) {
            StatCard(
                title: "Local",
                count: viewModel.localCount,
                systemImage: "internaldrive",
                tint: .green
            )
            StatCard(
                title: "Remote",
                count: viewModel.remoteCount,
                systemImage: "icloud.and.arrow.down",
                tint: .blue
            )
            StatCard(
                title: "Showing",
                count: viewModel.filteredItems.count,
                systemImage: "photo.on.rectangle.angled",
                tint: .orange
            )
        }
    }

    private var filterPicker: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Filter")
                .font(.headline)

            Picker("Filter", selection: $viewModel.selectedFilter) {
                ForEach(GalleryFilter.allCases) { filter in
                    Text(filter.displayName).tag(filter)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var stylePicker: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Image Style")
                .font(.headline)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(ImageStyle.allCases) { style in
                        Button {
                            viewModel.selectedStyle = style
                        } label: {
                            Text(style.displayName)
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(
                                    Capsule()
                                        .fill(
                                            viewModel.selectedStyle == style
                                                ? Color.accentColor
                                                : Color(.tertiarySystemFill)
                                        )
                                )
                                .foregroundStyle(
                                    viewModel.selectedStyle == style
                                        ? Color.white
                                        : Color.primary
                                )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var galleryGrid: some View {
        LazyVGrid(columns: gridColumns, spacing: 16) {
            ForEach(viewModel.filteredItems) { item in
                Button {
                    selectedItem = item
                } label: {
                    GalleryImageCard(item: item)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

private struct StatCard: View {
    let title: String
    let count: Int
    let systemImage: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(title, systemImage: systemImage)
                .font(.caption.weight(.semibold))
                .foregroundStyle(tint)

            Text("\(count)")
                .font(.title2.weight(.bold))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(.secondarySystemGroupedBackground))
        )
    }
}

#Preview {
    GalleryView()
}
