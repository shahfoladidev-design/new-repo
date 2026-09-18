import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal-document-page";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/privacy", "privacyTitle", "privacyDescription");
}

export default function PrivacyPage() {
  return <LegalDocumentPage namespace="legal.privacy" />;
}
