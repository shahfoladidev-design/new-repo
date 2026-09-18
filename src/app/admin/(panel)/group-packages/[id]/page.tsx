import { AdminContentEdit } from "@/components/admin/content-edit-wrapper";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminContentEdit
      table="packages"
      adminPath="/admin/group-packages"
      id={id}
      defaultPackageType="group"
      extraFields={["price", "province", "packageExtra"]}
    />
  );
}
