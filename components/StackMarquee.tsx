"use client";

import { Braces, Cpu, Database, Globe2, Network, Workflow } from "lucide-react";
import { LogoCloud, type Logo } from "@/components/ui/logo-cloud-3";

const STACK: Logo[] = [
  { alt: "Python", category: "Languages", src: "/logos/python.svg" },
  { alt: "TypeScript", category: "Languages", src: "/logos/typescript.svg" },
  { alt: "Dart", category: "Languages", src: "/logos/dart.svg" },
  { alt: "Kotlin", category: "Languages", src: "/logos/kotlin.svg" },
  { alt: "C / C++", category: "Languages", src: "/logos/cplusplus.svg" },
  { alt: "Flutter", category: "Runtime", src: "/logos/flutter.svg" },
  { alt: "Next.js", category: "Runtime", src: "/logos/nextdotjs.svg" },
  { alt: "ONNX Runtime", category: "Runtime", src: "/logos/onnx.svg" },
  { alt: "REST APIs", category: "Runtime", icon: Network },
  { alt: "On-device ML", category: "Domains", icon: Cpu },
  { alt: "Vector retrieval", category: "Domains", icon: Database },
  { alt: "Geospatial", category: "Domains", icon: Globe2 },
  { alt: "Compilers", category: "Domains", icon: Braces },
  { alt: "Git", category: "Delivery", src: "/logos/git.svg" },
  { alt: "SAP Activate", category: "Delivery", src: "/logos/sap.svg" },
  { alt: "Agile / Scrum", category: "Delivery", icon: Workflow },
  { alt: "Claude Code", category: "Delivery", src: "/logos/claude.svg" },
];

export default function StackMarquee() {
  return <LogoCloud logos={STACK} />;
}
