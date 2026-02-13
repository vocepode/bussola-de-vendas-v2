import ScriptEditor from "@/pages/ScriptEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = await params;
  return <ScriptEditor ideaId={ideaId} />;
}

