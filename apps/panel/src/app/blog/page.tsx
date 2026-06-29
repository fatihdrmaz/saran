import Link from "next/link";
import { Button, PageHeader } from "../../components/ui";
import { BlogList } from "./BlogList";

export default function BlogPage() {
  return (
    <>
      <PageHeader
        title="Blog"
        subtitle="Web sitesi makaleleri — yayınlı ve taslak"
        action={
          <Link href="/blog/yeni">
            <Button>+ Yeni makale</Button>
          </Link>
        }
      />
      <BlogList />
    </>
  );
}
