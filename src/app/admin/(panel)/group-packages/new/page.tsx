import { AdminContentEdit } from "@/components/admin/content-edit-wrapper";

export default function Page() {
  return (
    <AdminContentEdit
      table="packages"
      adminPath="/admin/group-packages"
      defaultPackageType="group"
      extraFields={["price", "province", "packageExtra"]}
    />
  );
}
