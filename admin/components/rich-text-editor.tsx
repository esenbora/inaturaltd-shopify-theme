"use client";

/**
 * Rich-text editor for blog article bodies.
 *
 * Wraps TipTap v3 (StarterKit + Link). Two mirrored modes share one HTML value:
 *   - "wysiwyg": the TipTap editor (formatting toolbar).
 *   - "html":    a raw <textarea> escape hatch. This is the important one — the
 *                pain being solved is that Shopify's TinyMCE freezes on large
 *                pastes, so a power user can paste/edit big HTML here smoothly.
 *
 * The value is always an HTML string. `onChange` fires with the current HTML
 * from whichever mode is active; switching modes re-syncs the other view.
 */

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

type Mode = "wysiwyg" | "html";

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  label,
  children,
}: ToolbarButtonProps) {
  const base =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const state = active
    ? "bg-ink text-white"
    : "text-muted hover:bg-sand";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`${base} ${state}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  // Prompt for a URL and apply/replace a link on the current selection.
  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return; // cancelled
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }, [editor]);

  const unsetLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line bg-sand/50 px-2 py-1.5">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        H3
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

      <ToolbarButton
        label="Add link"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        Link
      </ToolbarButton>
      <ToolbarButton
        label="Remove link"
        disabled={!editor.isActive("link")}
        onClick={unsetLink}
      >
        Unlink
      </ToolbarButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<Mode>("wysiwyg");

  const editor = useEditor({
    // Required for Next.js SSR: rendering during SSR would cause a hydration
    // mismatch, so defer the first render to the client.
    immediatelyRender: false,
    extensions: [
      // StarterKit ships its own Link; disable it and use the explicit
      // extension so external links get safe rel/target attributes.
      StarterKit.configure({ link: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        // `rte-content` is styled in globals.css (no typography plugin needed).
        class: "rte-content min-h-[16rem] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  // Keep the WYSIWYG editor in sync when `value` changes from the outside
  // (e.g. the HTML textarea was edited, or a parent reset the field).
  useEffect(() => {
    if (!editor) return;
    if (mode !== "wysiwyg") return;
    if (editor.getHTML() === value) return;
    // `false` = don't emit an update (avoids a feedback loop with onChange).
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value, mode]);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-line bg-sand/50 px-2 py-1.5">
        <div
          className="inline-flex rounded-md bg-sand p-0.5 text-xs font-medium"
          role="tablist"
          aria-label="Editor mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "wysiwyg"}
            onClick={() => switchMode("wysiwyg")}
            className={`rounded px-2.5 py-1 transition-colors ${
              mode === "wysiwyg"
                ? "bg-card text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "html"}
            onClick={() => switchMode("html")}
            className={`rounded px-2.5 py-1 transition-colors ${
              mode === "html"
                ? "bg-card text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            HTML
          </button>
        </div>
      </div>

      {mode === "wysiwyg" ? (
        editor ? (
          <>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
          </>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted">
            Loading editor…
          </div>
        )
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="block min-h-[16rem] w-full resize-y bg-card px-4 py-3 font-mono text-xs leading-relaxed text-ink focus:outline-none"
          placeholder="<p>Raw HTML — paste or edit large content here.</p>"
        />
      )}
    </div>
  );
}
