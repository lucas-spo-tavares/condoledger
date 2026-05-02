import { ResidentFormTemplate } from "@/components/templates/residents/resident-form-template";

type ResidentEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResidentEditPage({ params }: ResidentEditPageProps) {
  const { id } = await params;

  return <ResidentFormTemplate residentId={id} />;
}
