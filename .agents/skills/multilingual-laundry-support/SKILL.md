---
name: multilingual-laundry-support
description: Provide natural multilingual customer support for In & Out Laundry in Modern Standard Arabic, Gulf Arabic, Sudanese Arabic when needed, English, Urdu, Hindi, and Tagalog, including mixed-language understanding, preserving order numbers, names, addresses, and service names, and replying in the customer's language without unnecessary language switching. Use when designing or editing customer-facing AI replies, prompts, translation behavior, language detection, or multilingual support flows.
---

# Multilingual Laundry Support

## Purpose

Use this skill when Codex needs to make the customer-support agent understand and reply naturally across the languages used by In & Out Laundry customers and staff.
The agent should sound like helpful support, not a literal translator.

## Supported Languages

- Modern Standard Arabic
- Gulf Arabic
- Sudanese Arabic when needed
- English
- Urdu
- Hindi
- Tagalog

## Core Rules

1. Reply in the customer's language.
2. Keep the same language across the conversation unless the customer switches.
3. Understand mixed writing naturally.
4. Preserve order numbers, names, phone numbers, addresses, and map links exactly.
5. Do not translate service names in a confusing way.
6. Keep operational terms consistent with the laundry domain.
7. If language is ambiguous, reply in the dominant language and keep key terms from the customer.

## Mixed-Language Examples

Understand messages like:

- `عايز pickup اليوم`
- `my abaya لسه ما وصلت`
- `order 256719 جاهز؟`

In these cases:

- keep `pickup`, `abaya`, and `order 256719` recognizable
- answer in the dominant customer language
- do not over-translate proper nouns or operational terms

## Preserve These Exactly

Never alter:

- order numbers
- invoice numbers
- customer names
- phone numbers
- addresses
- Google Maps links
- branch names unless using an approved alias
- item names when the customer wrote them clearly

## Service Name Handling

Avoid confusing translations for common laundry terms.
Use customer-friendly equivalents while preserving meaning:

- `pickup`
- `delivery`
- `wash and iron`
- `dry cleaning`
- `ironing`
- `abaya`
- `kandoora`
- `ghutra`
- `blanket`

If a service term is known locally in English, keep it in English inside Arabic replies when it is clearer.

## Arabic Style

For Arabic:

- use Gulf-friendly Arabic for UAE customer support
- use Modern Standard Arabic when the customer writes formally
- use Sudanese Arabic only when the customer clearly uses Sudanese phrasing or asks for it
- keep the tone polite, short, and warm

## Urdu, Hindi, And Tagalog

For Urdu, Hindi, and Tagalog:

- keep replies simple and operational
- avoid complex idioms
- preserve service names and order ids
- ask one clear question when details are missing

## Language Switching

Do not switch languages just because one word is in another language.
Switch only when:

- the customer switches language clearly
- the customer asks for another language
- the conversation is handed to a staff channel with a known staff language

## Reference Files

Read [references/multilingual-laundry-support.md](references/multilingual-laundry-support.md) for language behavior, mixed-language handling, and safe translation examples.
