import { AdminContentEdit } from "@/components/admin/content-edit-wrapper";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminContentEdit table="tour_departures" adminPath="/admin/upcoming-tours" id={id} extraFields={["departure", "price"]} />;
}
