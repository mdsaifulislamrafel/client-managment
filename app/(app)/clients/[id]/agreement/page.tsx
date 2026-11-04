import Agreement from "@/components/Agreement";

export default function Page({ params }: { params: { id: string } }) {
  return <Agreement kind="clients" id={params.id} />;
}
