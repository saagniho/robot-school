import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CLASSES, getClass } from "@/lib/curriculum";
import { ClassOne } from "@/components/classes/class-one";
import { ClassTwo } from "@/components/classes/class-two";
import { ClassThree } from "@/components/classes/class-three";
import { ClassFour } from "@/components/classes/class-four";
import { ClassFive } from "@/components/classes/class-five";

export const dynamicParams = false;

export function generateStaticParams() {
  return CLASSES.filter((c) => c.live).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const cls = getClass((await params).slug);
  return { title: cls ? `Class ${cls.num} — ${cls.title} · Robot School` : "Robot School" };
}

const LESSONS: Record<string, React.ComponentType> = {
  "a-student-who-learns": ClassOne,
  "good-examples-great-student": ClassTwo,
  "spotters-and-makers": ClassThree,
  "robot-words": ClassFour,
  "the-guessing-game": ClassFive,
};

export default async function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const Lesson = LESSONS[slug];
  if (!Lesson) notFound();
  return <Lesson />;
}
