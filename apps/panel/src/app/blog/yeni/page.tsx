import { PageHeader } from "../../../components/ui";
import { ArticleForm } from "../ArticleForm";

export default function NewArticlePage() {
  return (
    <>
      <PageHeader
        title="Yeni makale"
        subtitle="Taslak olarak kaydedin veya hemen yayınlayın"
      />
      <ArticleForm />
    </>
  );
}
