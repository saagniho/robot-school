import type { Metadata } from "next";
import { Graduation } from "@/components/graduation";

export const metadata: Metadata = { title: "Graduation Day · Robot School" };

export default function GraduationPage() {
  return <Graduation />;
}
