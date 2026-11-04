import Agreement from "@/components/Agreement";

export default function Page({ params }: { params: { id: string } }) {
  return <Agreement kind="package-clients" id={params.id} />;
}
