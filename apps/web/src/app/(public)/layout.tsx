import React from "react";
import { PublicLayout as PublicSiteLayout } from "@/components/layouts/public-layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicSiteLayout>{children}</PublicSiteLayout>;
}
