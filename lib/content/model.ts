import seed from "./seed.json";
export const seedContent = seed;
export type PortfolioContent = typeof seed;
export type Field = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "url"
    | "image"
    | "file"
    | "number"
    | "boolean"
    | "select"
    | "list";
  options?: string[];
  fields?: Field[];
};
export type ContentSection = { key: string; label: string; fields: Field[] };
export const iconNames = [
  "Braces",
  "Cpu",
  "Database",
  "Globe2",
  "Network",
  "Workflow",
  "Boxes",
  "Code2",
  "GraduationCap",
  "Map",
  "Music",
  "Smartphone",
  "Users",
  "CalendarDays",
  "MapPinned",
  "ScanSearch",
];
const selections: Record<string, string[]> = {
  icon: iconNames,
  section: ["about", "credentials", "projects", "leadership", "contact"],
  source: ["manual", "work", "credentials"],
  kind: ["Discipline", "Interest"],
  category: ["Employment", "Internship", "Volunteering", "Campus leadership"],
};
const urls = new Set([
  "href",
  "primaryHref",
  "linkHref",
  "demoUrl",
  "verificationUrl",
]);
const images = new Set(["portrait", "image", "imgSrc", "src"]);
function describe(record: Record<string, unknown>, section: string): Field[] {
  return Object.entries(record)
    .filter(([key]) => key !== "id")
    .map(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
      if (Array.isArray(value))
        return {
          key,
          label,
          type: "list",
          fields: describe(value[0] || {}, section),
        };
      if (typeof value === "boolean") return { key, label, type: "boolean" };
      if (typeof value === "number") return { key, label, type: "number" };
      if (key === "category" && section === "credentials")
        return {
          key,
          label,
          type: "select",
          options: ["Certification", "Course completion"],
        };
      if (selections[key] && (key !== "category" || section === "experience"))
        return { key, label, type: "select", options: selections[key] };
      return {
        key,
        label,
        type: urls.has(key)
          ? "url"
          : images.has(key)
            ? "image"
            : key === "cv"
              ? "file"
              : [
                    "summary",
                    "lede",
                    "quote",
                    "description",
                    "detail",
                    "body",
                    "contribution",
                  ].includes(key)
                ? "textarea"
                : "text",
      };
    });
}
export const contentSchema: ContentSection[] = Object.entries(seed).map(
  ([key, value]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    fields: describe(value, key),
  }),
);
export function isSafeUrl(value: string, media = false): boolean {
  if (!value) return true;
  if (value !== value.trim() || /[\u0000-\u0020\u007f\\]/.test(value))
    return false;
  if (value.startsWith("/") && !value.startsWith("//"))
    return !/%(?:2f|5c)/i.test(value);
  if (!media && /^#[A-Za-z][\w-]*$/.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function validateContent(value: unknown): PortfolioContent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Content must be an object.");
  const input = value as Record<string, unknown>;
  const read = (
    obj: unknown,
    fields: Field[],
    path: string,
  ): Record<string, unknown> => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj))
      throw new Error(`${path} must be an object.`);
    const record = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const field of fields) {
      const v = record[field.key],
        name = `${path}.${field.key}`;
      if (field.type === "list") {
        if (!Array.isArray(v) || v.length > 200)
          throw new Error(`${name} must be a list with at most 200 entries.`);
        const ids = new Set<string>();
        result[field.key] = v.map((entry, index) => {
          if (
            !entry ||
            typeof entry.id !== "string" ||
            !/^[a-zA-Z0-9_-]{1,80}$/.test(entry.id) ||
            ids.has(entry.id)
          )
            throw new Error(`${name} requires unique stable IDs.`);
          ids.add(entry.id);
          const parsed = read(entry, field.fields!, `${name}[${index}]`);
          const titleKey = ["name", "title", "label", "alt"].find(
            (key) => key in parsed,
          );
          if (
            !parsed.archived &&
            titleKey &&
            !(parsed[titleKey] as string).trim()
          )
            throw new Error(`${name}[${index}].${titleKey} is required.`);
          return { id: entry.id, ...parsed };
        });
      } else if (field.type === "boolean") {
        if (typeof v !== "boolean")
          throw new Error(`${name} must be true or false.`);
        result[field.key] = v;
      } else if (field.type === "number") {
        if (
          typeof v !== "number" ||
          !Number.isFinite(v) ||
          v < 0 ||
          v > 1000000000 ||
          (field.key === "pad" && v > 8)
        )
          throw new Error(`${name} is outside its supported range.`);
        result[field.key] = v;
      } else {
        if (
          typeof v !== "string" ||
          v.length > (field.type === "textarea" ? 10000 : 2000)
        )
          throw new Error(`${name} is missing or too long.`);
        if (
          ["url", "image", "file"].includes(field.type) &&
          !isSafeUrl(v, field.type !== "url")
        )
          throw new Error(`${name} must be a safe URL or local path.`);
        if (field.options && !field.options.includes(v))
          throw new Error(`${name} has an unsupported choice.`);
        if (
          ["startDate", "endDate", "issueDate", "expiryDate"].includes(
            field.key,
          ) &&
          v &&
          !/^\d{4}-(0[1-9]|1[0-2])$/.test(v)
        )
          throw new Error(`${name} must use YYYY-MM.`);
        result[field.key] = v;
      }
    }
    return result;
  };
  const result = Object.fromEntries(
    contentSchema.map((section) => [
      section.key,
      read(input[section.key], section.fields, section.key),
    ]),
  ) as PortfolioContent;
  for (const r of result.experience.items) {
    if (r.endDate && r.startDate && r.endDate < r.startDate)
      throw new Error("Experience end date must follow its start date.");
  }
  for (const r of result.credentials.items) {
    if (r.issueDate && r.expiryDate && r.expiryDate < r.issueDate)
      throw new Error("Credential expiry must follow its issue date.");
  }
  const sections = result.navigation.items.map((r) => r.section);
  if (new Set(sections).size !== sections.length)
    throw new Error("Each navigation section can appear once.");
  if (
    result.contact.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.contact.email)
  )
    throw new Error("Enter a valid email address.");
  if (result.contact.phone && !/^\+?[\d\s().-]+$/.test(result.contact.phone))
    throw new Error("Enter a valid phone number.");
  if (!result.profile.fullName.trim() || !result.seo.title.trim())
    throw new Error("Name and search title are required.");
  return result;
}
export function activeItems<T extends { archived: boolean }>(items: T[]): T[] {
  return items.filter((item) => !item.archived);
}
export function getMetrics(content: PortfolioContent) {
  return activeItems(content.about.metrics).map((metric) => ({
    ...metric,
    value:
      metric.source === "work"
        ? activeItems(content.work.items).length
        : metric.source === "credentials"
          ? activeItems(content.credentials.items).length
          : metric.value,
  }));
}
