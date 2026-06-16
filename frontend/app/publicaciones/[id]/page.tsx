import { redirect } from "next/navigation";

export default async function PublicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // LEGACY MODULE
  // Pendiente de retiro tras validacion funcional.
  redirect(`/produccion-cientifica/${id}`);
}
