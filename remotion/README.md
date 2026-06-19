# Campaign Asset Studio (Remotion)

Dynamic, config-driven generation of campaign assets. The same typed data model
renders to three formats, previews live in the browser via `@remotion/player`,
and downloads at full production resolution via the Remotion **Still API**.

## Architecture

The system separates the three concerns the brief calls for:

| Concern | Where |
| --- | --- |
| **Asset configuration** | `manifest.ts` (pure data — id, dimensions, schema, defaults, editor fields) + `templates/*/schema.ts` (Zod) |
| **Rendering logic** | `templates/*/*.tsx` compositions + reusable `components/*` primitives |
| **UI controls** | `src/components/asset-studio/*` (data-driven from each template's `fields`) |

- `manifest.ts` holds **no React/Remotion imports**, so the server-side render
  route (`src/app/api/render/route.ts`) can validate props without pulling
  Remotion's browser runtime into a Server Component.
- `registry.ts` layers the React components on top of the manifest for the
  preview/editor and the Remotion entry (`index.ts` → `Root.tsx`).
- Fonts (`fonts.ts`): Halyard Display is bundled locally
  (`public/fonts/`); Lexend Deca loads via `@remotion/google-fonts`. Both are
  awaited in `calculateMetadata` so the Still render and the Player agree.

## Adding a new template

1. Define a Zod schema + `defaultProps` + `fields` (see `templates/promo/schema.ts`).
2. Build the composition component using the shared primitives in `components/`.
3. Append one entry to `TEMPLATE_META` in `manifest.ts` and map the component
   in `registry.ts`.

The editor panel, live preview, format tabs and download endpoint all read from
the registry — no other file needs to change.

## Reference fidelity

Compositions recreate the Figma "performance assets" templates. The signature
rounded-pentagon image masks are the exact Figma vector silhouettes
(`public/templates/mask-promo-*.svg`); the purple radial glow backdrop is
recreated with CSS gradients so its colours stay editable.
