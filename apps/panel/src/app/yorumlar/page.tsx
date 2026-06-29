import { PageHeader } from "../../components/ui";
import { ReviewsList } from "./ReviewsList";

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        title="Yorumlar"
        subtitle="Hasta yorumları — moderasyon"
      />
      <ReviewsList />
    </>
  );
}
