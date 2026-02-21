import { Head } from "@/components/seo/head";
import { CreateItemPage } from "../components/create-item/CreateItemPage";

export function CreateItem() {
  return (
    <>
      <Head title="Add Item" description="Add a new item or service" />
      <CreateItemPage />
    </>
  );
}
