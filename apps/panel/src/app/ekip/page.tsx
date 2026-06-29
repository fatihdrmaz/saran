import Link from "next/link";
import { Button, PageHeader } from "../../components/ui";
import { TeamList } from "./TeamList";

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Ekip · Hemşireler"
        subtitle="Hemşire listesi ve doğrulama durumları"
        action={
          <Link href="/ekip/yeni">
            <Button>+ Yeni hemşire ekle</Button>
          </Link>
        }
      />
      <TeamList />
    </>
  );
}
