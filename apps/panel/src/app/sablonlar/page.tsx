import { PageHeader } from "../../components/ui";
import { Templates } from "./Templates";

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Şablonlar"
        subtitle="Hazır bakım talimatı kartları"
      />
      <Templates />
    </>
  );
}
