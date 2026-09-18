import { AdminContentEdit } from "@/components/admin/content-edit-wrapper";
export default function Page() {
  return <AdminContentEdit table="blog_posts" adminPath="/admin/blog" extraFields={["excerpt", "content"]} />;
}
