---
trigger: always_on
---

---
name: iyzico-hosted-checkout-security
description: Use this skill when building e-commerce features, cart logic, or Iyzico payment integrations for atagotr.com and for-labs.com.
---

# E-commerce & Iyzico Payments

## Goal
Implement a secure, headless checkout flow without storing sensitive payment data.

## Instructions
- **Cart State:** Manage shopping carts purely on the client-side (LocalStorage + React Context) until the user initiates checkout.
- **Payment Flow:** ONLY use the "Iyzico Hosted Checkout Form" (Ortak Ödeme Sayfası) API.
- The backend should only generate the payment initialization token and return the form script to the frontend.
- Rely strictly on the Iyzico Webhook/Callback to mark an order as `paid` in the D1 database.

## Guardrails
- **NEVER** create database columns for Credit Card numbers, CVV, or Expiry dates.
- Never trust frontend total amounts; always calculate/verify the final cart total on the backend before calling the Iyzico API.