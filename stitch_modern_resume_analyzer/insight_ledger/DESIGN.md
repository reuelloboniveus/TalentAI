# Design System Strategy: The Analytical Edge

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Precision Curator."** In an industry often cluttered with dense text and rigid tables, this system seeks to elevate resume analysis into a high-end editorial experience. 

We move beyond the "SaaS template" look by leveraging intentional asymmetry and tonal depth. The goal is to make data feel like a narrative. By utilizing expansive whitespace and high-contrast typography scales, we guide the user’s eye through complex information with the authority of a premium financial journal and the intelligence of a high-tech laboratory.

## 2. Colors & Surface Philosophy
The palette is anchored in `primary` (#041627), a deep, authoritative navy that provides the intellectual "weight" of the system. This is balanced by a high-energy `secondary` (#0059bb) and a surgical `tertiary` (#001918) for data-driven accents.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. We define boundaries exclusively through background shifts. A `surface-container-low` section sitting on a `surface` background creates a natural, sophisticated break that feels architectural rather than "boxed in."

### Surface Hierarchy & Nesting
Treat the UI as a series of layered, physical materials.
*   **Base:** `surface` (#f7f9fb)
*   **Depth Level 1:** `surface-container-low` (#f2f4f6) for large structural areas.
*   **Depth Level 2:** `surface-container-highest` (#e0e3e5) for interactive sidebar elements.
*   **The Float:** `surface-container-lowest` (#ffffff) for the primary content cards, creating a "lifted" paper effect.

### The "Glass & Gradient" Rule
To escape the "flat" look, utilize Glassmorphism for floating navigation or overlays. Use `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur. For primary CTAs, apply a subtle linear gradient from `primary` (#041627) to `primary_container` (#1a2b3c) at a 135-degree angle to add a metallic, premium "soul" to the action.

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance character with readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-intellectual" feel. Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) for hero moments to establish immediate authority.
*   **Body & Labels (Inter):** The workhorse. Inter’s high x-height ensures that resume data remains legible at `body-sm` (0.875rem) sizes. 

**The Hierarchy Rule:** Always pair a `headline-md` in `on_surface` with a `body-md` in `on_surface_variant` (#44474c). The tonal shift from black to deep grey creates an automatic visual hierarchy without needing to change font weights.

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "pop"; we use them to simulate natural environment light.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. The contrast in hex values provides all the "border" you need.
*   **Ambient Shadows:** For "Active" or "Floating" states, use an extra-diffused shadow: `0px 20px 40px rgba(4, 22, 39, 0.06)`. Note the use of the `primary` color (navy) in the shadow rather than pure black to keep the shadows "airy" and integrated.
*   **The "Ghost Border":** If accessibility requires a stroke (e.g., in high-contrast modes), use `outline_variant` (#c4c6cd) at **15% opacity**. It should be felt, not seen.

## 5. Components

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary_container`), `8px` (xl) corners. Text in `on_primary`. 
*   **Secondary:** Ghost style. No background, `outline` stroke at 20% opacity, text in `secondary`.
*   **Interaction:** On hover, primary buttons should shift +2px upward with a soft `secondary` ambient glow.

### Data Chips (The Resume Attributes)
*   **Style:** Use `surface-container-high` backgrounds with `label-md` typography.
*   **Roundedness:** Always `full` (9999px) to contrast against the `8px` (xl) radius of content cards.

### Input Fields
*   **Base:** `surface-container-lowest` background. 
*   **Border:** None. Use a bottom-only `outline-variant` 2px stroke that transitions to `secondary` (#0059bb) on focus.
*   **Micro-copy:** Error states must use `error` (#ba1a1a) in `label-sm` positioned precisely 4px below the input.

### Content Cards (Resume Previews)
*   **Rule:** Forbid divider lines between resume sections. Use `24px` (or `xl` spacing) of vertical whitespace to separate "Experience" from "Education."
*   **Hover:** Transition the background from `surface-container-lowest` to `surface-bright`.

### Suggested Feature: The "Insight Overlay"
A glassmorphic side-panel (Backdrop-blur 20px, `surface` at 70% opacity) that slides over the resume content to show AI-driven analysis, using `tertiary_fixed` (#79f6ed) for data visualizations.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. A narrow left column for metadata and a wide right column for the resume body creates a bespoke, editorial feel.
*   **Do** lean heavily into `surface-container-low` for page backgrounds to make white content cards feel premium.
*   **Do** use `letter-spacing: -0.01em` on all Manrope headlines.

### Don't
*   **Don't** use 100% black (#000000) for text. Always use `on_surface` (#191c1e) to maintain a soft, high-end look.
*   **Don't** use standard "drop shadows" with 20%+ opacity. It makes the "data-driven" app look like a 2010s mobile app.
*   **Don't** use dividers. If you feel the need to separate two things, increase the margin-bottom to the next step in the spacing scale instead.