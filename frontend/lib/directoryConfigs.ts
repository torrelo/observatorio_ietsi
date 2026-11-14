import type { DirectoryConfig, DirectoryFilter } from "./directoryQuery";
import type { getResearcherFilterOptions } from "./researchers";
import type { getProjectFilterOptions } from "./projects";
import type { getResearchUnitFilterOptions } from "./researchUnits";

const field = (name:string,label:string,options:string[],extra=false,labels?:Record<string,string>):DirectoryFilter => ({name,label,options,extra,labels});

export function researcherDirectoryConfig(o: ReturnType<typeof getResearcherFilterOptions>): DirectoryConfig {
  return {
    path:"/investigadores", noun:"investigadores", searchLabel:"Buscar investigadores",
    searchHelp:"Busca por nombre, ORCID, filiación, unidad, áreas temáticas y títulos de publicaciones vinculadas.",
    defaultSort:"-n_publications", sorts:Object.fromEntries(o.sortOptions.map(s => [s.value,s.label])),
    filters:[
      field("institution","Institución",o.institutions),field("unit","Unidad",o.units),field("network","Red asistencial",o.networks),
      field("thematic_area","Área temática",o.thematicAreas),field("orcid","Disponibilidad de ORCID",o.orcid),
      field("country","País",o.countries,true),field("review_status","Estado de revisión del perfil",o.reviewStatuses,true,{auto_curated:"Curado automáticamente",requires_manual_review:"Pendiente de revisión"}),
      field("study_type","Tipo de estudio",o.studyTypes,true),field("first_year","Primera publicación desde",o.firstYears,true),
      field("last_year","Última publicación hasta",o.lastYears,true),field("quartile","Con publicaciones en cuartil",o.quartiles,true),
    ],
  };
}

export function projectDirectoryConfig(o: ReturnType<typeof getProjectFilterOptions>): DirectoryConfig {
  return {
    path:"/proyectos",noun:"proyectos",searchLabel:"Buscar proyectos",
    searchHelp:"Busca por título, código, descripción, investigador, unidad, red, IPRESS o temática registrada.",
    defaultSort:"source_order",sorts:{source_order:"Orden de la base institucional",title:"Título (A–Z)","-start_date":"Inicio más reciente",status:"Estado (A–Z)"},
    filters:[
      field("status","Estado",o.statuses),field("type","Tipo de proyecto",o.types),field("principal","Investigador principal",o.principals),
      field("start_year","Año de inicio",o.years),field("unit","Unidad ejecutora",o.units),field("network","Red asistencial",o.networks),field("thematic_area","Área temática",o.thematicAreas),
      field("thematic_category","Categoría temática",o.thematicCategories,true),field("ipress","IPRESS",o.ipress,true),
      field("ethics_status","Aprobación ética",o.ethicsStatuses,true),field("ready_status","Preparación del dato (gestión)",o.readyStatuses,true),
    ],
  };
}

export function unitDirectoryConfig(o: ReturnType<typeof getResearchUnitFilterOptions>): DirectoryConfig {
  return {
    path:"/unidades",noun:"unidades",searchLabel:"Buscar unidades",
    searchHelp:"Busca por nombre, código RCI, responsable, personal vinculado, línea de investigación, red, IPRESS o CIEI.",
    defaultSort:"source_order",sorts:{source_order:"Orden de la base institucional",name:"Nombre (A–Z)",network:"Red asistencial (A–Z)",type:"Tipo de unidad (A–Z)"},
    filters:[
      field("unit_type","Tipo de unidad",o.unitTypes),field("network","Red asistencial",o.networks),field("ipress","IPRESS",o.ipress),
      field("unit_status","Estado de la unidad",o.unitStatuses),field("thematic_area","Área temática",o.thematicAreas),
      field("has_ciei","CIEI en la red",o.hasCiei,true),field("ciei_status","Estado del CIEI asociado",o.cieiStatuses,true),field("ready_status","Preparación del dato (gestión)",o.readyStatuses,true),
    ],
  };
}
