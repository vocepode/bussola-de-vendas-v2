import { redirect } from "next/navigation";
import Module from "@/pages/Module";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "raio-x") redirect("/raio-x");
  if (slug === "mapa") redirect("/mapa");
  return <Module slug={slug} />;
}

