# Cowork Acquisition & Revenue Sync

Updated: 2026-09-10

## Role of this repo

`internetmatt/OpenIdeas` owns reusable **workflow/flow definitions, campaign logic, classifications, and acquisition/attribution recipes** attached to Ideas sessions and Projecto events.

Canonical mapping:

- **Ideas** = AIONUI-style idea/session surface and Cowork inbox.
- **OpenIdeas** = Flowise-style reusable flows/workflows attached to ideas, assistants, campaigns, and acquisition paths.
- **Projecto** = runtime/event-bus/orchestration layer.
- **Google Drive OpenIdea Vault** = cross-repo operating context, specs, reviews, roadmaps, and handoffs.

## Inputs from Projecto/Cowork

OpenIdeas workflows consume normalized events with fields equivalent to:

```ts
export type AcquisitionStrategy =
  | "user"
  | "service"
  | "merch"
  | "royalty";

export interface CoworkEvent {
  id: string;
  source: "instagram" | "youtube" | "tiktok" | "web" | "email";
  accountId: string;
  actorId?: string;
  kind:
    | "message"
    | "comment"
    | "mention"
    | "follow"
    | "content"
    | "lead"
    | "order"
    | "royalty"
    | "commission";
  acquisition?: AcquisitionStrategy;
  ideaId?: string;
  conversationId?: string;
  contentId?: string;
  campaignId?: string;
  occurredAt: string;
  payload: unknown;
}
```

## Workflow responsibilities

Reusable flows should handle:

- activity classification
- lead qualification
- creator/business identity enrichment
- campaign association
- content follow-up/remix decisions
- service-acquisition follow-up
- merch commission attribution
- royalty/licensing attribution
- user-acquisition attribution
- approval gates before sensitive or external actions

## Profit/acquisition recipes

1. `user` — viewer/follower → registered user, subscriber, member, SaaS user, or digital-product customer.
2. `service` — viewer/contact → qualified lead → consultation, SOW, retainer, or project.
3. `merch` — content/audience → purchase → margin, affiliate fee, or creator commission.
4. `royalty` — media/IP usage, licensing, streams, collaborations, or recurring rights revenue.

A campaign may use one or multiple strategies. The optimization target is attributed revenue/profit, with views/followers/engagement as leading indicators.

## Initial account graph

Business/client nodes:

- Revolution Speed
- Computer Zone Marietta
- Calo Landscape
- Boxframebilly

Creator/media nodes:

- YEB Show
- Corey Vintage
- Brixx Bryson
- Boxframebilly
- additional approved creator accounts

## Shared entities

`Creator`, `Brand`, `Account`, `Audience`, `Idea`, `OpenIdea`, `ContentAsset`, `Campaign`, `Offer`, `Product`, `Service`, `Lead`, `Customer`, `Conversion`, `Commission`, `Royalty`, `Payout`, `Expense`, `Revenue`, `Profit`, `Attribution`.

## End-to-end contract

`source adapter -> Projecto normalized event -> identity resolver -> Ideas Cowork -> OpenIdeas classification/follow-up flow -> conversion/revenue attribution -> Projecto learning loop`

Start by proving one source/account through the full chain before adding more adapters.

## Boundary

Flows should depend on authorized/public activity and first-party analytics, not private scraping or inaccessible platform data.
