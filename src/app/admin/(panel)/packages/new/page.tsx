import { AdminContentEdit } from "@/components/admin/content-edit-wrapper";

export default function Page() {
  return (
    <AdminContentEdit
      table="packages"
      adminPath="/admin/packages"
      defaultPackageType="private"
      extraFields={["price", "province", "packageExtra"]}
    />
  );
}
