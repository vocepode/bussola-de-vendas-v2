import { redirect } from "next/navigation";
import Module from "@/pages/Module";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "raio-x") redirect("/raio-x");
  return <Module slug={slug} />;
}

