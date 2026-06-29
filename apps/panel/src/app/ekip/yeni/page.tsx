import { PageHeader } from "../../../components/ui";
import { NurseOnboarding } from "./NurseOnboarding";

export default function NewNursePage() {
  return (
    <>
      <PageHeader
        title="Yeni hemşire ekle"
        subtitle="3 adımlı doğrulama formu · Onaylanmadan hastalara atanamaz"
      />
      <NurseOnboarding />
    </>
  );
}
