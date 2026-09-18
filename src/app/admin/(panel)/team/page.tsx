import { AdminContentList } from "@/components/admin/content-list";
export default function Page() {
  return <AdminContentList table="team_members" adminPath="/admin/team" nameField />;
}
