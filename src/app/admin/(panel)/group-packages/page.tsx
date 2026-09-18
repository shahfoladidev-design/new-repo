import { AdminContentList } from "@/components/admin/content-list";

export default function Page() {
  return (
    <AdminContentList
      table="packages"
      adminPath="/admin/group-packages"
      packageType="group"
      titleKeyOverride="groupPackages"
    />
  );
}
