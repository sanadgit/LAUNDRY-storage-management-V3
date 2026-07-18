---
name: uae-location-routing
description: Understand Abu Dhabi and UAE customer locations for In & Out Laundry dispatch and branch routing, including area aliases in Arabic and English, sectors, branch mapping, driver zone mapping, Google Maps link parsing, latitude/longitude extraction, and unclear-location handling. Use when interpreting customer addresses, assigning service areas, selecting branches, or routing pickup and delivery drivers.
---

# UAE Location Routing

## Purpose

Use this skill when Codex needs to understand a customer location, normalize an Abu Dhabi area name, extract coordinates, or route the request to the correct branch and driver zone.
This skill supports driver dispatch, pickup booking, delivery, and branch selection.

## Core Rules

1. Normalize area names before matching.
2. Support Arabic and English aliases for the same area.
3. Extract latitude and longitude from Google Maps links when available.
4. Use configured branch and driver zone data when assigning.
5. If the area is unclear, ask for clarification or location pin.
6. Do not invent branch coverage or driver zones.

## Supported Area Aliases

Recognize these common variants:

- `MBZ`, `Mohammed Bin Zayed`, `Mohamed Bin Zayed`, `مدينة محمد بن زايد`, `محمد بن زايد`
- `Mussafah`, `Musaffah`, `Mussafah M-13`, `مصفح`, `مصفّح`
- `Shakhbout City`, `Khalifa City B`, `مدينة شخبوط`, `شخبوط`
- `Khalifa City`, `Khalifa City A`, `مدينة خليفة`, `خليفة`
- `Al Falah`, `Falah`, `الفلاح`, `مدينة الفلاح`
- `Al Riyadh`, `Riyadh City`, `مدينة الرياض`, `الرياض`

## Routing Flow

Apply this flow:

1. Read the customer's text address or map link.
2. Normalize Arabic and English text.
3. Extract coordinates if present.
4. Match to known area aliases.
5. Determine service area.
6. Determine responsible branch from configured branch coverage.
7. Determine eligible driver zones.
8. Return routing confidence and missing information.

## Google Maps Handling

When a Google Maps link is present:

- keep the original URL
- expand or resolve shortened links when the workflow supports it
- extract coordinates from URL patterns when visible
- store `latitude` and `longitude` separately
- use coordinates only when they are valid numbers

If the link cannot be parsed, ask for a location pin or typed area.

## Branch Mapping

Known branch names in project files include:

- `Al Falah`
- `MBZ`
- `Musaffah`

Some files also refer to branch ids such as:

- `Al Falah` = `1`
- `MBZ` = `2`
- `Musaffah` = `3`

Treat this as project evidence, but verify against the live branch configuration before writing operational data.

## Driver Zone Mapping

Driver assignment should use configured driver zones.
If no driver-zone table exists, return the normalized area and branch candidate so the dispatch workflow can rank drivers safely.

## Unclear Location Handling

Ask for clarification when:

- customer gives only a building name with no area
- area has multiple possible branches
- map link cannot be parsed
- coordinates are outside expected service areas
- typed address conflicts with map coordinates

Use a short request such as:

`Please send your location pin or area name so we can assign the correct branch and driver.`

## Reference Files

Read [references/uae-location-routing.md](references/uae-location-routing.md) for alias maps, coordinate handling, branch routing notes, and safe fallback behavior.
