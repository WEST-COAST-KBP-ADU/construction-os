import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModelDetail } from "@/src/components/content/ModelCatalog";
import {
  findPublicModel,
  getPublicModelCatalog,
  type PublicModelCatalogEntry,
} from "@/src/lib/publicModelCatalog";

type ModelRouteProps = {
  params: Promise<{ model: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const catalog = await getPublicModelCatalog();

  return catalog.models.map((model) => ({ model: model.modelId }));
}

async function resolveModel(
  params: ModelRouteProps["params"],
): Promise<PublicModelCatalogEntry> {
  const { model: modelId } = await params;
  const catalog = await getPublicModelCatalog();
  const model = findPublicModel(catalog, modelId);

  if (!model) {
    notFound();
  }

  return model;
}

export async function generateMetadata({
  params,
}: ModelRouteProps): Promise<Metadata> {
  const model = await resolveModel(params);

  return {
    title: `${model.title} model`,
    description: `${model.title} is an owned West Coast KBP concept-only model record with published facts and explicit unknowns.`,
    alternates: {
      canonical: `/models/${model.modelId}`,
    },
  };
}

export default async function ModelPage({ params }: ModelRouteProps) {
  const [catalog, model] = await Promise.all([
    getPublicModelCatalog(),
    resolveModel(params),
  ]);

  return (
    <main id="main-content" className="site-main spine-home">
      <ModelDetail catalog={catalog} model={model} />
    </main>
  );
}
