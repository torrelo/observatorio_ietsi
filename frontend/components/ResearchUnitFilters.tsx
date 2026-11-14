import { DirectoryFilterFields } from "@/components/directories/DirectoryFilterFields";
import { unitDirectoryConfig } from "@/lib/directoryConfigs";
import { normalizeDirectoryQuery, type SearchParams } from "@/lib/directoryQuery";
import type { getResearchUnitFilterOptions } from "@/lib/researchUnits";

export function ResearchUnitFilters({ options, params }: { options: ReturnType<typeof getResearchUnitFilterOptions>; params: SearchParams }) {
  const config = unitDirectoryConfig(options);
  return <DirectoryFilterFields config={config} query={normalizeDirectoryQuery(config, params)} />;
}
