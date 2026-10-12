"use client";

import { Braces, Cpu, Database, Globe2, Network, Workflow } from "lucide-react";
import { LogoCloud, type Logo } from "@/components/ui/logo-cloud-3";

export default function StackMarquee({ items, title }: {title:string;items: {id:string;archived:boolean;alt:string;category:string;src:string;icon:string}[]}) {
 const icons: Record<string,typeof Braces>={Braces,Cpu,Database,Globe2,Network,Workflow};
 const logos: Logo[]=items.filter(item=>!item.archived).map(item=>({...item,src:item.src || undefined,icon:icons[item.icon] || Braces}));
 return <LogoCloud logos={logos} title={title} />;
}
