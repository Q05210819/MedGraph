import { graphUpdatedAt, medicalLinks, medicalNodes } from "@/data/medical-data";

export async function GET() {
  return Response.json({
    meta: { source: "interview-mock", updatedAt: graphUpdatedAt, version: "1.0.0" },
    nodes: medicalNodes,
    links: medicalLinks,
  });
}
