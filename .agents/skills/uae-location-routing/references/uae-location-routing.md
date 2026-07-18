# UAE Location Routing Reference

## Project Context

This skill helps route In & Out Laundry customer requests by Abu Dhabi location.
Driver dispatch depends on service area, branch, and driver zone, so location interpretation must be conservative and auditable.

## Area Alias Map

Use these aliases as initial matching hints:

| Canonical area | Aliases |
|---|---|
| MBZ | MBZ, Mohammed Bin Zayed, Mohamed Bin Zayed, مدينة محمد بن زايد, محمد بن زايد |
| Mussafah | Mussafah, Musaffah, مصفح, مصفّح, M-13 |
| Shakhbout City | Shakhbout City, Khalifa City B, مدينة شخبوط, شخبوط |
| Khalifa City | Khalifa City, Khalifa City A, مدينة خليفة, خليفة |
| Al Falah | Al Falah, Falah, الفلاح, مدينة الفلاح |
| Al Riyadh | Al Riyadh, Riyadh City, مدينة الرياض, الرياض |

## Text Normalization

Normalize customer location text by:

- lowercasing English
- trimming whitespace
- removing repeated punctuation
- normalizing Arabic alef variants
- normalizing Arabic taa marbuta/haa only for matching
- keeping the original address for audit

## Coordinate Handling

For latitude and longitude:

- parse decimal values only
- reject impossible UAE coordinates
- store both numeric values and original map URL
- use coordinates to improve routing confidence

Do not reverse-geocode unless the workflow has a configured geocoding provider.

## Google Maps URL Patterns

Look for coordinates in common patterns such as:

- `@24.123456,54.123456`
- `q=24.123456,54.123456`
- `ll=24.123456,54.123456`
- `query=24.123456,54.123456`

Short links may require expansion before parsing.

## Branch Routing Notes

Known project branch evidence:

- Al Falah appears as a branch.
- MBZ appears as branch id `2` in POS/accounting files.
- Musaffah appears as branch id `3` in workflow code.

Branch assignment must still come from the configured branch coverage table when available.

## Driver Zone Notes

Driver zone mapping should return:

- normalized area
- coordinates if known
- candidate branch
- candidate driver zones
- confidence level
- clarification question if needed

## Confidence Levels

Use:

- `high`: exact alias or valid coordinates inside configured zone
- `medium`: clear area name but branch/driver mapping not configured
- `low`: partial area, building name only, or conflicting location data
- `unknown`: no usable location

## Safe Fallback

If the system cannot route confidently:

- ask for location pin
- ask for area name
- escalate to branch manager if operationally urgent
- avoid assigning a driver randomly
