# Consent wording (shown on the Conéctate con nosotros page, melibee.art/contacto)

The sign-up form reads its consent wording from Firestore, so the exact text a
person agreed to is stored once and every sign-up records which version they saw.

Approved by Melissa (Nov 2026). Legal name in the consent boxes:
**Melissa Soto DBA Flowers by Melibee**.

## Create version v1 in the Firebase console

Firestore Database -> Start collection (or open it) `consentTexts` -> Add document

- Document ID: `v1`
- Add these fields, all type **string**:

| Field | Value |
|---|---|
| `effectiveDate` | 2026-11-__ (the day you publish it) |
| `transactional_es` | Al marcar esta casilla, acepto recibir mensajes de texto o WhatsApp no publicitarios de Melissa Soto DBA Flowers by Melibee sobre mis pedidos, recordatorios de entrega o recogida, y respuestas a mis preguntas. El consentimiento no es requisito para comprar. La frecuencia de los mensajes varía. Pueden aplicar tarifas de mensajes y datos. Escribe HELP para recibir ayuda; responde STOP para cancelar. |
| `transactional_en` | By checking this box, I consent to receive non-marketing text or WhatsApp messages from Melissa Soto DBA Flowers by Melibee about my orders, delivery or pickup reminders, and responses to my inquiries. Consent is not a condition of purchase. Message frequency varies. Msg & data rates may apply. Text HELP for help; reply STOP to opt out. |
| `marketing_es` | Al marcar esta casilla, acepto recibir mensajes de marketing y promociones de Melissa Soto DBA Flowers by Melibee por texto o WhatsApp al número proporcionado, incluyendo ofertas especiales, descuentos, recordatorios de fechas especiales y avisos de temporada. El consentimiento no es requisito para comprar. La frecuencia de los mensajes varía. Pueden aplicar tarifas de mensajes y datos. Escribe HELP para recibir ayuda; responde STOP para cancelar. |
| `marketing_en` | By checking this box, I consent to receive marketing and promotional text or WhatsApp messages from Melissa Soto DBA Flowers by Melibee at the phone number provided, including special offers, discounts, special-date reminders and seasonal announcements. Consent is not a condition of purchase. Message frequency varies. Msg & data rates may apply. Text HELP for help; reply STOP to opt out. |
| `privacy_es` | Usamos tu información solo para atender tus pedidos, enviarte correos ocasionales de Flowers by Melibee (puedes darte de baja en cualquier momento) y, si lo aceptas arriba, mensajes de texto o WhatsApp. Nunca vendemos tu información. |
| `privacy_en` | We only use your information to handle your orders, send you occasional emails from Flowers by Melibee (you can unsubscribe at any time) and, if you agree above, text or WhatsApp messages. We never sell your information. |

## Changing the wording later

Never edit `v1` after people have signed up with it. Instead:

1. Create a new document `v2` with the new text (same field names).
2. In `src/pages/ClubPage.js`, change `CONSENT_VERSION = "v1"` to `"v2"`.
3. Run `yarn update "Consent wording v2"`.

Older sign-ups keep pointing to `v1`, which stays as proof of what they agreed to.

## Links for different places

Add `?src=` so you know where each sign-up came from:

- Bouquet card QR code: `https://melibee.art/contacto?src=bouquet_card`
- Giveaways: `https://melibee.art/contacto?src=giveaway`
- Markets / events: `https://melibee.art/contacto?src=event`
- English by default: add `&lang=en`
