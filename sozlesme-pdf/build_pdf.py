#!/usr/bin/env python3
"""Markdown -> branded A4 PDF for the INature/Stimilon contract set.

pandoc renders the markdown, WeasyPrint does the paged layout so the Stimilon
masthead and page numbers repeat on every page via CSS @page margin boxes.

Drop a real logo at the repo root (stimilon-logo.svg|png|jpg) to replace the
built-in mark; nothing else needs to change.
"""
import base64
import mimetypes
import pathlib
import re
import subprocess
import sys

from weasyprint import HTML, CSS

HERE = pathlib.Path(__file__).parent
REPO = pathlib.Path("/Users/boraesen/Desktop/inaturaltd")

# Masthead duplicated inside the markdown; the running header carries it now.
MASTHEAD = re.compile(
    r"\*\*Stimilon LLC\*\*\s*\n30 N Gould St[^\n]*Sheridan, WY 82801, USA\s*\n",
    re.MULTILINE,
)

FALLBACK_MARK = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" '
    'viewBox="0 0 40 40">'
    '<path d="M30.5 9.4C28.2 6.7 24.6 5 20.4 5 13.6 5 9 8.7 9 13.9c0 4.6 3.2 7.3 '
    '9.4 8.9l3.1.8c3.9 1 5.4 2.2 5.4 4.3 0 2.6-2.6 4.4-6.6 4.4-3.9 0-7-1.7-9.2-4.6" '
    'fill="none" stroke="#E0532C" stroke-width="4.6" stroke-linecap="round" '
    'stroke-linejoin="round"/></svg>'
)

LOGO_CANDIDATES = ["stimilon-logo.svg", "stimilon-logo.png", "stimilon-logo.jpg"]

# Tables taller than this many rows are allowed to break across pages.
LONG_TABLE_ROWS = 12


def logo_data_uri() -> tuple[str, bool]:
    for name in LOGO_CANDIDATES:
        path = REPO / name
        if not path.exists():
            continue
        mime = mimetypes.guess_type(str(path))[0] or "image/png"
        data = base64.b64encode(path.read_bytes()).decode()
        return f"data:{mime};base64,{data}", True
    data = base64.b64encode(FALLBACK_MARK.encode()).decode()
    return f"data:image/svg+xml;base64,{data}", False


def to_html_fragment(md_path: pathlib.Path) -> str:
    text = MASTHEAD.sub("", md_path.read_text(encoding="utf-8"))
    result = subprocess.run(
        ["pandoc", "--from", "markdown+pipe_tables+raw_html", "--to", "html5"],
        input=text, capture_output=True, text=True, check=True,
    )
    return result.stdout


def style_fragment(html: str) -> str:
    """First h1 is the document title; the paragraph after it is the subtitle."""
    html = html.replace("<h1", '<h1 class="doctitle"', 1)
    html = re.sub(r"(</h1>\s*)<p>", r'\1<p class="subtitle">', html, count=1)

    # Tall tables get break-inside:auto so they split instead of overflowing.
    def mark(match: re.Match) -> str:
        block = match.group(0)
        if block.count("<tr") > LONG_TABLE_ROWS:
            return block.replace("<table>", '<table class="long">', 1)
        return block

    html = re.sub(r"<table>.*?</table>", mark, html, flags=re.DOTALL)

    # Ballot glyphs fall back to different system fonts and render at
    # inconsistent sizes; draw the boxes in CSS instead.
    html = html.replace("\u2611", '<span class="cb on"></span>')
    html = html.replace("\u2610", '<span class="cb"></span>')
    return html


def build(md_path: pathlib.Path, out_path: pathlib.Path, css_text: str) -> int:
    body = style_fragment(to_html_fragment(md_path))
    page = (
        '<!doctype html><html lang="tr"><head><meta charset="utf-8">'
        f"<title>{md_path.stem}</title></head><body>{body}</body></html>"
    )
    doc = HTML(string=page, base_url=str(REPO)).render(
        stylesheets=[CSS(string=css_text)]
    )
    doc.write_pdf(out_path)
    return len(doc.pages)


DOC_LABELS = {
    "INature-Hizmet-Sozlesmesi-TR-v3": ("Hizmet Sözleşmesi", "Ana sözleşme"),
    "INature-DPA-TR-v1": ("Veri İşleme Ek Sözleşmesi", "DPA, madde 10.3 eki"),
    "INature-IDTA-Tablolar-v1": ("UK IDTA: Doldurulmuş Tablolar", "IDTA, madde 10.3 eki"),
    "INature-TRA-v1": ("Aktarım Risk Değerlendirmesi", "TRA, madde 10.3 eki"),
}


def cover_html(md_paths: list[pathlib.Path]) -> str:
    rows = []
    for i, md in enumerate(md_paths, 1):
        title, note = DOC_LABELS.get(md.stem, (md.stem, ""))
        rows.append(
            f'<tr><td class="n">{i}</td><td class="t">{title}</td>'
            f'<td class="d">{note}</td></tr>'
        )
    return (
        '<section class="cover">'
        "<h1 class=\"doctitle\">INature UK</h1>"
        '<p class="subtitle">Sözleşme paketi</p>'
        '<p class="lede">Bu paket dört belgeden oluşur. Dördü birlikte imzalanır; '
        "2, 3 ve 4 numaralı belgeler Hizmet Sözleşmesi'nin 10.3 maddesi uyarınca "
        "sözleşmenin ayrılmaz ekidir.</p>"
        f'<table class="contents">{"".join(rows)}</table>'
        '<p class="lede">Hizmet Sağlayıcı: Stimilon LLC, Wyoming, ABD. '
        "Müşteri: INature. Uygulanacak hukuk: İngiltere ve Galler.</p>"
        "</section>"
    )


def build_merged(md_paths: list[pathlib.Path], out: pathlib.Path, css: str) -> int:
    parts = [cover_html(md_paths)]
    for md in md_paths:
        parts.append(f'<section class="doc">{style_fragment(to_html_fragment(md))}</section>')
    page = (
        '<!doctype html><html lang="tr"><head><meta charset="utf-8">'
        "<title>INature UK sözleşme paketi</title></head><body>"
        + "".join(parts)
        + "</body></html>"
    )
    doc = HTML(string=page, base_url=str(REPO)).render(stylesheets=[CSS(string=css)])
    doc.write_pdf(out)
    return len(doc.pages)


def main() -> None:
    args = sys.argv[1:]
    uri, real = logo_data_uri()
    css_text = (HERE / "print.css").read_text(encoding="utf-8").replace("__LOGO__", uri)
    print(f"logo: {'real asset' if real else 'built-in fallback mark'}")

    if args and args[0] == "--merge":
        out = REPO / args[1]
        md_paths = [REPO / n for n in args[2:]]
        pages = build_merged(md_paths, out, css_text)
        print(f"  {out.name}  {pages} sayfa  ({out.stat().st_size // 1024} KB)")
        return

    for name in args:
        md = REPO / name
        out = md.with_suffix(".pdf")
        pages = build(md, out, css_text)
        print(f"  {out.name}  {pages} sayfa  ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
