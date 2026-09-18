import { AdminContentEdit } from "@/components/admin/content-edit-wrapper";
export default function Page() {
  return <AdminContentEdit table="faqs" adminPath="/admin/faqs" extraFields={["faq"]} />;
}
