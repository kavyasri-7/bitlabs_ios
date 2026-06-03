import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

class ScormService {
  /**
   * Fetches imsmanifest.xml from the SCORM package URL and returns
   * the count of LEAF items (actual slides/subtopics shown in the course menu).
   *
   * In Articulate Storyline, the manifest has a structure like:
   *   <organization>
   *     <item identifierref="...">  ← slide 1 (leaf)
   *     <item identifierref="...">  ← slide 2 (leaf)
   *     ...
   *   </organization>
   *
   * We count only items that have an identifierref (i.e. they point to
   * actual content), not container items.
   */
  async countSubtopicsFromUrl(scormUrl: string): Promise<number> {
    try {
      const baseUrl = scormUrl.substring(0, scormUrl.lastIndexOf('/') + 1);
      const manifestUrl = `${baseUrl}imsmanifest.xml`;
      console.log(`🌎 [SCORM MANIFEST] Fetching: ${manifestUrl}`);

      const response = await axios.get(manifestUrl, {
        timeout: 8000,
        responseType: 'text',
      });

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        isArray: (name) => name === 'item',
      });

      const result = parser.parse(response.data);

      try {
        // Navigate: manifest > organizations > organization > item[]
        const manifest = result?.manifest;
        const organizations = manifest?.organizations;
        const organization = Array.isArray(organizations?.organization)
          ? organizations.organization[0]
          : organizations?.organization;
        const items: any[] = organization?.item || [];

        // Count only leaf items (those with identifierref — actual slides)
        const leafCount = this.countLeafItems(items);
        console.log(`✅ [SCORM MANIFEST] Found ${leafCount} subtopics in course menu`);
        return leafCount;
      } catch (parseErr) {
        console.error('❌ [SCORM MANIFEST] Structure error:', parseErr);
        return 0;
      }
    } catch (error) {
      console.warn('⚠️ [SCORM MANIFEST] Could not fetch manifest:', error);
      return 0;
    }
  }

  /**
   * Recursively count leaf items (items that have identifierref = actual content slides).
   * Items without identifierref are just containers/chapters.
   */
  private countLeafItems(items: any[]): number {
    let count = 0;
    for (const item of items) {
      const hasContent = item?.['@_identifierref'];
      const children: any[] = item?.item || [];

      if (children.length > 0) {
        // This is a container — recurse into children
        count += this.countLeafItems(children);
      } else if (hasContent) {
        // This is a leaf slide
        count++;
      }
    }
    return count;
  }
}

export default new ScormService();
