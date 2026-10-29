import { PublicLayout } from "@/components/layouts/public-layout";
import PublicHomePage from "./(public)/home-page";

export default function Home() {
  return (
    <PublicLayout>
      <PublicHomePage />
    </PublicLayout>
  );
}
