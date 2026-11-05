/**
 * The Stimilon signature.
 *
 * Uses the official logo asset at `public/brand/stimilon-lockup.svg`, copied
 * from the canonical master in the Stimilon brand system. The brand rules are
 * explicit that the signature is the real lockup: it is not rebuilt out of
 * text, not redrawn, not recoloured to a product accent, and no second tagline
 * is set next to it. Keeping it as a referenced file rather than inline SVG
 * means a master update is a one-file copy rather than a hunt through JSX.
 *
 * The lockup's own artwork is `#1e1b16` ink, which is what it is meant to be
 * on a light surface; the panel's cream background is exactly that case.
 *
 * `variant` only changes the wrapper's spacing and the attribution line, never
 * the artwork.
 */

interface StimilonSignatureProps {
  /** "footer" sits under the app chrome; "auth" centres under the sign-in card. */
  variant?: "footer" | "auth";
}

export function StimilonSignature({ variant = "footer" }: StimilonSignatureProps) {
  const centred = variant === "auth";

  return (
    <div
      className={[
        "flex items-center gap-2.5",
        centred ? "justify-center" : "justify-start",
      ].join(" ")}
    >
      <span className="text-[0.7rem] text-muted">Built and maintained by</span>
      {/*
        A plain <img> rather than next/image: the asset is an SVG, so there is
        nothing for the image optimiser to do, and routing it through
        /_next/image would need `dangerouslyAllowSVG` turned on for the whole
        app. That flag exists because SVG can carry script, and the panel's CSP
        is built to stop exactly that.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/stimilon-lockup.svg"
        alt="Stimilon"
        width={68}
        height={20}
        className="h-5 w-auto"
      />
    </div>
  );
}
