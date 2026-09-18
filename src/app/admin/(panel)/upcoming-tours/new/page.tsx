import { AdminContentEdit } from "@/components/admin/content-edit-wrapper";
export default function Page() {
  return <AdminContentEdit table="tour_departures" adminPath="/admin/upcoming-tours" extraFields={["departure", "price"]} />;
}
