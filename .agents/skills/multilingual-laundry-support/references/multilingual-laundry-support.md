# Multilingual Laundry Support Reference

## Project Context

The project already contains locale files for:

- Arabic: `ar`
- English: `en`
- Hindi: `hi`
- Tagalog: `tl`
- Urdu: `ur`

Customer-service AI should detect customer language and reply in the same language, while preserving operational facts exactly.

## Language Detection Guidance

Use signals such as:

- script: Arabic, Latin, Devanagari, Urdu
- dominant words
- previous conversation language
- customer preference stored in contact record

If the message is mixed, choose the language that carries the request.

## Mixed-Language Handling

Examples:

`عايز pickup اليوم`

Reply in Arabic and keep `pickup` if it feels natural.

`my abaya لسه ما وصلت`

Reply in the dominant mixed Arabic/English style or Arabic, preserve `abaya`.

`order 256719 جاهز؟`

Reply in Arabic and preserve `order 256719`.

## Things Not To Translate Blindly

- customer names
- order ids
- invoice ids
- branch names
- addresses
- map links
- item names that are common in UAE laundry operations

## Tone By Language

Arabic:

- polite and concise
- Gulf-friendly if the customer writes casually
- formal Arabic if the customer writes formally

English:

- clear and professional
- avoid overly formal corporate wording

Urdu/Hindi/Tagalog:

- simple and practical
- avoid long explanations
- ask for missing order number or location clearly

## Safe Customer Reply Patterns

Missing order number:

`Please send the order number so I can check the status.`

Arabic equivalent:

`ارسل رقم الطلب عشان أقدر أشيك لك الحالة.`

Complaint:

`Sorry for the inconvenience. Please send the order number and a photo if the issue is visible.`

Arabic equivalent:

`نعتذر عن الإزعاج. ارسل رقم الطلب وصورة إذا المشكلة ظاهرة، وبنرفعها للمسؤول.`

## Preserve Facts

When rewriting or translating:

- copy numbers exactly
- copy links exactly
- copy customer-provided names exactly
- do not normalize address text unless a routing workflow stores both original and normalized versions
