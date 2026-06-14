import { Head } from "@/components/seo/head";
import { ItemListPage } from "../components/item-list/ItemListPage";

export function ItemList() {
  return (
    <>
      <Head
        title="Items & Services"
        description="Manage products and services"
      />
      <ItemListPage />
    </>
  );
}
