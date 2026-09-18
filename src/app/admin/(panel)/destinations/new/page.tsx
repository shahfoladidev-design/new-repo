import { AdminContentEdit } from "@/components/admin/content-edit-wrapper";
export default function Page() {
  return <AdminContentEdit table="destinations" adminPath="/admin/destinations" extraFields={["location"]} />;
}
