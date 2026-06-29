import { PageHeader } from "../../components/ui";
import { Inbox } from "./Inbox";

export default function InboxPage() {
  return (
    <>
      <PageHeader title="Gelen kutusu" subtitle="Hastalarınızla yazışmalar" />
      <Inbox />
    </>
  );
}
