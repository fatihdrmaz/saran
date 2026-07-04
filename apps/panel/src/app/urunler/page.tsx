import { PageHeader } from "../../components/ui";
import { ProductsManager } from "./ProductsManager";

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Ürünler"
        subtitle="Plan ürünleri — fiyat ve süre yönetimi (yalnızca admin düzenleyebilir)"
      />
      <ProductsManager />
    </>
  );
}
