# Prompt: Fix the "AI Slop" Look of RentWheels Frontend

Use this prompt with your AI coding assistant, aimed specifically at the
`vehicle-rental-frontend/` folder (index.html, vehicles.html, rental.html,
history.html, css/style.css).

---

```text
Redesign the visual design of this car/bike rental frontend
(RentWheels). The current version looks generic and AI-generated. I
want it to look like it was designed by a human with a specific point
of view, not a templated SaaS starter kit.

First, DIAGNOSE what currently makes it look AI-generated. Check for
these common tells and call out which ones are present:
- A generic purple/blue gradient background or gradient buttons
- Every section wrapped in an identical rounded white card with the
  same soft drop-shadow (rgba(0,0,0,.1) on everything)
- One border-radius value applied uniformly regardless of hierarchy
- Tracked-out ALL-CAPS labels above headings ("FEATURES", "OUR FLEET")
- Meta text joined with middle dots or spaced em dashes ("Car · Bike
  · Available")
- Emoji used as icons (🚗 🏍️ 💰) instead of real iconography or none
  at all
- A default system font stack or generic Inter/Roboto with no
  personality
- Centered hero text with a gradient-colored word for emphasis
- A "Features" grid of 3 identical icon+title+description cards
- Buttons that all say generic things like "Learn More" / "Get
  Started" instead of describing the actual action ("Rent this bike",
  "Return vehicle")
- Fade-in-on-scroll animations on every single section
- Excessive whitespace/padding that makes the page feel empty rather
  than considered

Then REDESIGN with an actual point of view grounded in what this
product is: a rental service for real vehicles (cars and motorbikes)
with live, ticking, time-based billing. Lean into that subject matter
rather than generic "tech startup" styling. Concretely:

1. Pick a real color palette (4-6 named hex values) that has some
   connection to the domain — think garage/workshop, dashboard
   instrumentation, license plates, odometers, fuel gauges — not a
   generic SaaS blue/purple gradient. Justify the palette in one
   sentence.

2. Pick one or two real typefaces with personality (not the default
   Inter/Roboto/system-ui), and set a deliberate type scale. If using
   a display face for headings, make sure it's clearly distinct from
   the body face.

3. Design the "live bill" on rental.html as the actual hero moment of
   the product — this is the single most distinctive interaction in
   the whole app (a number that visibly increases in real time). Give
   it a treatment that feels like it belongs on a taxi meter,
   dashboard, or fuel gauge — not a plain floating number in a card.

4. Kill uniform card styling. Not every piece of content needs to be
   a rounded-corner white box with a shadow. Use borders, dividers,
   alignment, and typography hierarchy to organize content instead of
   wrapping everything in identical containers.

5. Write real interface copy specific to this product instead of
   generic template text. Buttons should say the exact action ("Rent
   this Classic 350", "Return Vehicle", "View past rentals") not
   generic verbs. No filler taglines like "Your journey starts here."

6. Remove decorative animation. If you keep any motion, make it
   purposeful — e.g., the live bill ticking up, or a vehicle status
   changing state — not scroll-triggered fade-ins on every section.

7. Make sure vehicle listings (cars vs bikes) look visually distinct
   from each other in some small deliberate way, since they're
   different vehicle types with different relevant info (seats/fuel
   type vs engine capacity/bike type).

Before writing any CSS, give me a short design plan: color palette
with hex values, typography choices, and a one-paragraph description
of the layout concept for the vehicle list page and the active rental
page. I'll review that plan before you implement it in the HTML/CSS.

Keep the implementation to plain HTML, CSS, and vanilla JS — no
frameworks, no external UI kits. It should still be responsive and
accessible (visible focus states, sufficient contrast).
```

---

### Why this works better than "make it look less AI"

Telling an AI assistant "make it look human" alone tends to produce
another generic style (it doesn't know which specific defaults to
avoid). This prompt instead:
- Names the actual visual patterns that read as AI-generated, so the
  assistant can self-diagnose your existing files against them
  instead of guessing
- Forces a domain-grounded design decision (garage/dashboard
  aesthetic) instead of "startup #7"
- Makes the live billing meter the intentional centerpiece, since
  that's the one feature your app has that a generic template
  wouldn't
- Requires a design plan/review step before code, so you can catch a
  bad direction before it's implemented in CSS
