"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Archive,
  Check,
  Download,
  Eye,
  Plus,
  RotateCcw,
  Save,
  Upload,
  X,
} from "lucide-react";
import {
  contentSchema,
  validateContent,
  type Field,
  type PortfolioContent,
} from "@/lib/content/model";

type RecordValue = Record<string, any>;

function newRecord(fields: Field[]): RecordValue {
  return Object.fromEntries([
    ["id", crypto.randomUUID()],
    ...fields.map((field) => [
      field.key,
      field.type === "list"
        ? []
        : field.type === "boolean"
          ? false
          : field.type === "number"
            ? 0
            : (field.options?.[0] ?? ""),
    ]),
  ]);
}

async function readResponse(response: Response) {
  let result: any;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server did not respond. Your edits are still here; try again.",
    );
  }
  if (!response.ok)
    throw new Error(
      result.error || "Could not complete the request. Try again.",
    );
  return result;
}

function downloadLocal(content: PortfolioContent) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(content, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `portfolio-draft-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const descriptions: Record<string, string> = {
  profile: "Your identity and CV, shared throughout the portfolio.",
  hero: "The first introduction visitors see.",
  about: "Your approach, background, and supporting numbers.",
  practices: "The disciplines and interests behind your work.",
  stack: "The tools and technologies you use.",
  credentials:
    "Certifications and completed courses, with supporting evidence.",
  awards: "Recognition and academic distinctions.",
  experience: "Employment, internships, volunteering, and campus leadership.",
  work: "The selected systems you want people to explore.",
  contact: "Ways to get in touch and the final words on your page.",
  navigation:
    "Reorder sections or archive a section to hide it from the page and navigation.",
  seo: "How your portfolio is described in search and shared links.",
};

export default function AdminEditor({
  initialContent,
  initialRevision,
}: {
  initialContent: PortfolioContent;
  initialRevision: number;
}) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(JSON.stringify(initialContent));
  const [revision, setRevision] = useState(initialRevision);
  const [selected, setSelected] = useState("profile");
  const [busy, setBusy] = useState("");
  const [uploads, setUploads] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const restoreInput = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const dirty = saved !== JSON.stringify(content);
  const section = contentSchema.find((item) => item.key === selected)!;
  const disabled = Boolean(busy) || uploads > 0;

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty || uploads > 0) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploads]);

  async function save() {
    if (!form.current?.reportValidity()) return false;
    setError("");
    setNotice("");
    setBusy("Saving draft");
    try {
      const checked = validateContent(content);
      const result = await readResponse(
        await fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: checked, revision }),
        }),
      );
      setContent(checked);
      setSaved(JSON.stringify(checked));
      setRevision(result.revision);
      setNotice("Draft saved. Your public portfolio has not changed.");
      return true;
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not save the draft.",
      );
      return false;
    } finally {
      setBusy("");
    }
  }

  async function publish() {
    confirmDialog.current?.close();
    setError("");
    setNotice("");
    setBusy("Publishing");
    try {
      const result = await readResponse(
        await fetch("/api/admin/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revision }),
        }),
      );
      if (typeof result.revision === "number") setRevision(result.revision);
      setNotice(
        "Published. Your portfolio will show the update on its next visit.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not publish. Your saved draft is safe.",
      );
    } finally {
      setBusy("");
    }
  }

  async function reloadDraft() {
    if (
      dirty &&
      !window.confirm(
        "Reload the saved draft and discard your unsaved changes? Download this draft first if you want to keep a copy.",
      )
    )
      return;
    setBusy("Reloading");
    setError("");
    try {
      const result = await readResponse(
        await fetch("/api/admin/content", { cache: "no-store" }),
      );
      const checked = validateContent(result.content);
      setContent(checked);
      setSaved(JSON.stringify(checked));
      setRevision(result.revision);
      setNotice("Loaded the latest saved draft.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not reload the draft.",
      );
    } finally {
      setBusy("");
    }
  }

  async function restoreFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error("Choose a draft JSON file smaller than 2 MB.");
      const parsed = JSON.parse(await file.text());
      const checked = validateContent(parsed.content ?? parsed);
      if (
        !window.confirm(
          "Replace the current editing draft with this file? Nothing will be published until you save and publish.",
        )
      )
        return;
      setContent(checked);
      setNotice(
        "Imported into the editor. Review, save, then publish when ready.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "This file could not be imported.",
      );
    } finally {
      if (restoreInput.current) restoreInput.current.value = "";
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a
          className="admin-brand"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Miel<span> / editor</span>
        </a>
        <div className="admin-actions">
          <a href="/" target="_blank" rel="noopener noreferrer">
            View live <ArrowUpRight size={15} />
          </a>
          <form
            action="/auth/logout"
            method="post"
            onSubmit={(event) => {
              if (
                dirty &&
                !window.confirm("Sign out and discard unsaved edits?")
              )
                event.preventDefault();
            }}
          >
            <button className="admin-text-button">Sign out</button>
          </form>
        </div>
      </header>
      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <p className="admin-sidebar-title">Your portfolio</p>
          <nav aria-label="Content sections">
            {contentSchema.map((item) => (
              <button
                key={item.key}
                aria-current={selected === item.key ? "page" : undefined}
                onClick={() => setSelected(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-tools">
            <button onClick={() => downloadLocal(content)}>
              <Download size={15} /> Download draft
            </button>
            <button
              disabled={disabled}
              onClick={() => restoreInput.current?.click()}
            >
              <Upload size={15} /> Import draft
            </button>
            <input
              ref={restoreInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => restoreFile(event.target.files?.[0])}
            />
            <a href="/api/admin/export" download>
              <Download size={15} /> Full backup
            </a>
            <button disabled={disabled} onClick={reloadDraft}>
              <RotateCcw size={15} /> Reload saved draft
            </button>
          </div>
        </aside>
        <main className="admin-main" id="editor-main">
          <div className="admin-heading">
            <div>
              <h1>{section.label}</h1>
              <p>{descriptions[selected]}</p>
            </div>
            <span className="admin-draft-label">
              {dirty ? "Unsaved changes" : "Saved draft"}
            </span>
          </div>
          <div className="admin-feedback" aria-live="polite" aria-atomic="true">
            {notice && (
              <p className="admin-notice">
                <Check size={17} aria-hidden="true" />
                {notice}
              </p>
            )}
            {error && (
              <p className="admin-error" role="alert">
                {error} Your edits remain in the editor. You can download them
                before reloading.
              </p>
            )}
          </div>
          <form
            ref={form}
            onSubmit={(event) => {
              event.preventDefault();
              if (!disabled) void save();
            }}
          >
            <fieldset disabled={disabled} className="admin-form-fields">
              <Fields
                key={section.key}
                fields={section.fields}
                value={(content as unknown as RecordValue)[section.key]}
                path={section.key}
                onChange={(value) => {
                  setContent((current) => ({
                    ...current,
                    [section.key]: value,
                  }));
                  setNotice("");
                }}
                onUpload={(delta) => setUploads((current) => current + delta)}
              />
            </fieldset>
          </form>
          <div className="admin-publish-bar">
            <p role="status">
              {busy ||
                (uploads
                  ? "Uploading file…"
                  : dirty
                    ? "Save your changes before previewing or publishing."
                    : `Draft revision ${revision}. Ready to preview.`)}
            </p>
            <div className="admin-actions">
              <button
                className="admin-button"
                disabled={disabled || (!dirty && revision > 0)}
                onClick={save}
              >
                <Save size={16} /> Save draft
              </button>
              {dirty || disabled ? (
                <button className="admin-button" disabled>
                  <Eye size={16} /> Preview
                </button>
              ) : (
                <a
                  className="admin-button"
                  href="/admin/preview"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye size={16} /> Preview
                </a>
              )}
              <button
                className="admin-button admin-primary"
                disabled={dirty || disabled || revision < 1}
                onClick={() => confirmDialog.current?.showModal()}
              >
                Publish <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
      <dialog
        ref={confirmDialog}
        className="admin-dialog"
        aria-labelledby="publish-title"
      >
        <h2 id="publish-title">Publish your saved draft?</h2>
        <p>
          All saved sections will replace the current public portfolio. Archived
          entries will be hidden. Preview your draft first if you haven’t
          reviewed it yet.
        </p>
        <div className="admin-actions">
          <button
            className="admin-button"
            onClick={() => confirmDialog.current?.close()}
          >
            Keep editing
          </button>
          <button className="admin-button admin-primary" onClick={publish}>
            Publish now
          </button>
        </div>
      </dialog>
    </div>
  );
}

function Fields({
  fields,
  value,
  path,
  onChange,
  onUpload,
}: {
  fields: Field[];
  value: RecordValue;
  path: string;
  onChange: (value: RecordValue) => void;
  onUpload: (delta: number) => void;
}) {
  return (
    <>
      {fields
        .filter((field) => field.key !== "archived")
        .map((field) => {
          const id = `${path}-${field.key}`;
          const change = (next: any) =>
            onChange({ ...value, [field.key]: next });
          if (field.type === "list")
            return (
              <ListField
                key={id}
                field={field}
                value={value[field.key]}
                path={id}
                onChange={change}
                onUpload={onUpload}
              />
            );
          if (field.type === "image" || field.type === "file")
            return (
              <MediaField
                key={id}
                id={id}
                field={field}
                value={value[field.key]}
                onChange={change}
                onUpload={onUpload}
              />
            );
          const isDate = [
            "startDate",
            "endDate",
            "issueDate",
            "expiryDate",
          ].includes(field.key);
          const derived =
            field.key === "value" && value.source && value.source !== "manual";
          return (
            <div
              className={`admin-field ${field.type === "boolean" ? "admin-check-field" : ""}`}
              key={id}
            >
              <label htmlFor={id}>
                {field.label}
                {derived ? " (calculated from published entries)" : ""}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={id}
                  value={value[field.key]}
                  onChange={(event) => change(event.target.value)}
                  rows={4}
                  maxLength={10000}
                />
              ) : field.type === "select" ? (
                <select
                  id={id}
                  value={value[field.key]}
                  onChange={(event) => change(event.target.value)}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "boolean" ? (
                <input
                  id={id}
                  type="checkbox"
                  checked={value[field.key]}
                  onChange={(event) => change(event.target.checked)}
                />
              ) : (
                <input
                  id={id}
                  type={
                    field.type === "number"
                      ? "number"
                      : isDate
                        ? "month"
                        : "text"
                  }
                  disabled={derived}
                  min={field.type === "number" ? 0 : undefined}
                  maxLength={2000}
                  value={value[field.key]}
                  onChange={(event) =>
                    change(
                      field.type === "number"
                        ? Number(event.target.value)
                        : event.target.value,
                    )
                  }
                />
              )}
              {field.type === "url" && (
                <small>
                  Use an https:// link, a local /path, or a #section link.
                </small>
              )}
              {isDate && (
                <small>
                  {field.key === "endDate"
                    ? "Leave empty if unknown; enable Current for an ongoing role."
                    : field.key === "startDate"
                      ? "Month and year the role began."
                      : "Optional month and year. Leave empty if unknown or not applicable."}
                </small>
              )}
            </div>
          );
        })}
    </>
  );
}

function ListField({
  field,
  value,
  path,
  onChange,
  onUpload,
}: {
  field: Field;
  value: RecordValue[];
  path: string;
  onChange: (value: RecordValue[]) => void;
  onUpload: (delta: number) => void;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const archived = value.filter((item) => item.archived).length;
  function move(index: number, delta: number) {
    const next = [...value];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  }
  return (
    <section className="admin-list" aria-label={field.label}>
      <div className="admin-list-heading">
        <h2>
          {field.label === "Items" ? "Entries" : field.label}{" "}
          <span>{value.length - archived}</span>
        </h2>
        <button
          className="admin-button"
          type="button"
          disabled={value.length >= 200}
          onClick={() => {
            const item = newRecord(field.fields!);
            onChange([...value, item]);
            setExpandedId(item.id);
          }}
        >
          <Plus size={16} /> Add entry
        </button>
      </div>
      {archived > 0 && (
        <label className="admin-archive-toggle">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
          />{" "}
          Show {archived} archived {archived === 1 ? "entry" : "entries"}
        </label>
      )}
      {value.filter((item) => showArchived || !item.archived).length === 0 && (
        <p className="admin-empty">
          No entries here yet. Add your first one to get started.
        </p>
      )}
      <div className="admin-entries">
        {value.map((item, index) => {
          if (item.archived && !showArchived) return null;
          const label =
            item.name ||
            item.title ||
            item.label ||
            item.alt ||
            item.org ||
            "Untitled entry";
          return (
            <details
              className={`admin-record ${item.archived ? "admin-record-archived" : ""}`}
              key={item.id}
              open={expandedId === item.id}
              onToggle={(event) => {
                if (event.currentTarget.open) setExpandedId(item.id);
                else
                  setExpandedId((current) =>
                    current === item.id ? null : current,
                  );
              }}
            >
              <summary>
                <span>
                  {label}
                  <small>
                    {item.issuer ||
                      item.org ||
                      item.category ||
                      item.kind ||
                      (item.archived ? "Archived" : "Draft entry")}
                  </small>
                </span>
                <span className="admin-expand-label">Edit</span>
              </summary>
              <div className="admin-record-body">
                <div className="admin-record-actions">
                  <button
                    type="button"
                    className="admin-button"
                    disabled={index === 0}
                    aria-label={`Move ${label} up`}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={15} /> Up
                  </button>
                  <button
                    type="button"
                    className="admin-button"
                    disabled={index === value.length - 1}
                    aria-label={`Move ${label} down`}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={15} /> Down
                  </button>
                  <button
                    type="button"
                    className="admin-button"
                    onClick={() =>
                      onChange(
                        value.map((entry, i) =>
                          i === index
                            ? { ...entry, archived: !entry.archived }
                            : entry,
                        ),
                      )
                    }
                  >
                    {item.archived ? (
                      <RotateCcw size={15} />
                    ) : (
                      <Archive size={15} />
                    )}
                    {item.archived ? "Restore" : "Archive"}
                  </button>
                </div>
                <Fields
                  fields={field.fields!}
                  value={item}
                  path={`${path}-${item.id}`}
                  onChange={(next) =>
                    onChange(
                      value.map((entry, i) => (i === index ? next : entry)),
                    )
                  }
                  onUpload={onUpload}
                />
              </div>
            </details>
          );
        })}
      </div>
      <p className="admin-note">
        Entries appear in this order unless the section groups them by date.
        Archive hides an entry after publishing; restore brings it back.
      </p>
    </section>
  );
}

async function prepareImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return file;
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Image preparation is unavailable. Try a smaller image.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.88),
    );
    if (!blob)
      throw new Error(
        "Could not prepare this image. Try a JPG, PNG, or WebP file.",
      );
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp",
    });
  } finally {
    bitmap.close();
  }
}

function MediaField({
  id,
  field,
  value,
  onChange,
  onUpload,
}: {
  id: string;
  field: Field;
  value: string;
  onChange: (value: string) => void;
  onUpload: (delta: number) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    setUploading(true);
    onUpload(1);
    try {
      if (file.size > 20 * 1024 * 1024)
        throw new Error("Choose an image under 20 MB or a PDF under 4 MB.");
      const prepared = field.type === "image" ? await prepareImage(file) : file;
      if (prepared.size > 4 * 1024 * 1024)
        throw new Error("The file must be under 4 MB after image compression.");
      const form = new FormData();
      form.set("file", prepared);
      const result = await readResponse(
        await fetch("/api/admin/upload", { method: "POST", body: form }),
      );
      onChange(result.url);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      onUpload(-1);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="admin-field admin-media-field">
      <label htmlFor={id}>{field.label}</label>
      {value && field.type === "image" && (
        <img
          className="admin-image-preview"
          src={value}
          alt={`Current ${field.label.toLowerCase()}`}
        />
      )}
      <input
        id={id}
        type="text"
        value={value}
        maxLength={2000}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="admin-actions">
        <button
          className="admin-button"
          type="button"
          disabled={uploading}
          onClick={() => input.current?.click()}
        >
          <Upload size={15} />
          {uploading
            ? "Uploading…"
            : field.type === "image"
              ? "Upload image"
              : "Upload PDF"}
        </button>
        {value && (
          <button
            type="button"
            className="admin-text-button"
            onClick={() => onChange("")}
          >
            <X size={15} /> Clear
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        hidden
        accept={
          field.type === "image"
            ? "image/jpeg,image/png,image/webp"
            : "application/pdf"
        }
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      <small>
        {field.type === "image"
          ? "JPG, PNG, or WebP. Images are resized before upload to save storage."
          : "PDF, up to 4 MB. Replacing this file updates every CV link when published."}
      </small>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
