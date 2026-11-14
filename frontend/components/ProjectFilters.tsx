import { DirectoryFilterFields } from "@/components/directories/DirectoryFilterFields";
import { projectDirectoryConfig } from "@/lib/directoryConfigs";
import { normalizeDirectoryQuery, type SearchParams } from "@/lib/directoryQuery";
import type { getProjectFilterOptions } from "@/lib/projects";

export function ProjectFilters({ options, params }: { options: ReturnType<typeof getProjectFilterOptions>; params: SearchParams }) {
  const config = projectDirectoryConfig(options);
  return <DirectoryFilterFields config={config} query={normalizeDirectoryQuery(config, params)} />;
}
