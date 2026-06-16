import { redirect } from "next/navigation";

export default async function PublicationsPage() {
  // LEGACY MODULE
  // Pendiente de retiro tras validacion funcional.
  redirect("/produccion-cientifica");
}
