import { AdminContentList } from "@/components/admin/content-list";
export default function Page() {
  return <AdminContentList table="blog_posts" adminPath="/admin/blog" />;
}
