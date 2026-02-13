import Module from "@/pages/Module";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Module slug={slug} />;
}

