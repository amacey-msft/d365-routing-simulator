# Unified Routing & Agent Configuration — Lab Guide

> **Prerequisites**: Dynamics 365 Contact Center licensed environment, System Administrator or Omnichannel Administrator role, and the `.env` file configured per `.env.example`.

---

## Routing Pipeline Mental Model

Before beginning, understand the end-to-end flow that every work item traverses:

```
Customer Contact → Workstream → Pre-chat Survey → Work Classification → Route-to-Queue → Assignment → Agent Workspace
```

See the full Mermaid diagram: [../diagrams/unified-routing-flow.mmd](../diagrams/unified-routing-flow.mmd)

**Key concepts:**

| Stage | What happens | Configured where |
|---|---|---|
| **Workstream** | Receives the work item from a channel (Chat, Email, Voice) | Customer Service admin center → Workstreams |
| **Pre-chat survey** | Collects context from the customer before routing | Workstream settings |
| **Work classification** | Evaluates rules to tag the work item (e.g., set skills) | Workstream → Work classification rulesets |
| **Route-to-queue** | Matches tagged work item to the right queue | Workstream → Route-to-queue rulesets |
| **Assignment** | Assigns work item to an available agent with matching skills and capacity | Queue → Assignment rules |
| **Agent workspace** | Agent receives and handles the conversation | Customer Service workspace app |

---

## Step 001 — Open Customer Service admin center

**Action**: Navigate to your Dynamics 365 environment and open the **Customer Service admin center** app.

- URL pattern: `https://<your-org>.crm.dynamics.com/main.aspx?app=customerserviceadmincenter`
- Or: Power Apps → your environment → Customer Service admin center



### WHY THIS STEP EXISTS
The Customer Service admin center is the single pane of glass for all Omnichannel and Unified Routing configuration. Without this, you cannot access workstreams, queues, skills, or routing rules.

### HOW IT WORKS
The admin center is a model-driven app that reads and writes to Dataverse tables (`msdyn_liveworkstream`, `msdyn_ocqueue`, `msdyn_skill`, etc.). All routing configuration is stored as Dataverse rows.

- ✅ **Expected Result**: The admin center landing page loads showing the site map with Workstreams, Queues, Routing, etc.
- ⚠️ **Common Pitfall**: If you don't see Omnichannel items in the site map, your environment may not have Customer Service Enterprise or Contact Center licenses applied.
- 💡 **Pro Tip**: Bookmark this URL — you'll return here frequently during configuration.

---

## Step 002 — Verify Unified Routing is enabled

**Action**: In the admin center site map, navigate to **Routing** (or **Unified routing**). Verify that Unified Routing is enabled for your environment.



### WHY THIS STEP EXISTS
Unified Routing is the engine that evaluates classification and routing rules. If it's not enabled, work items are routed using the legacy "push" mechanism, which doesn't support skills-based routing or ML-based classification.

### HOW IT WORKS
When enabled, Unified Routing intercepts every incoming work item and runs it through:
1. **Work classification rules** (to tag the item)
2. **Route-to-queue rules** (to find the right queue)
3. **Assignment rules** (to pick the best agent)

This is a tenant/environment-level setting stored in `msdyn_omnichannelconfiguration`.

- ✅ **Expected Result**: The Routing page shows "Unified routing" as **On** or **Enabled**.
- ⚠️ **Common Pitfall**: In some trial environments, Unified Routing may already be enabled by default. In production, an admin must explicitly turn it on.
- 💡 **Pro Tip**: Once enabled, Unified Routing cannot be disabled without contacting Microsoft Support.

---

## Step 003 — Navigate to Workstreams

**Action**: In the site map, click **Workstreams** to view the list of existing workstreams.



### WHY THIS STEP EXISTS
A workstream is the entry point for work items from a specific channel. Every chat, email, or voice call enters the routing pipeline through a workstream. You need to create one for chat before configuring routing rules.

### HOW IT WORKS
A workstream defines:
- **Channel type** (Chat, Email, Voice, etc.)
- **Work distribution mode** (Push, Pick)
- **Capacity profile** assignment
- **Classification and routing rulesets** attached to it

The workstream is the container that ties together the channel, the rules, and the queues.

- ✅ **Expected Result**: The workstreams list page loads. You may see existing workstreams or an empty list.
- ⚠️ **Common Pitfall**: Don't confuse workstreams with queues. A workstream receives work; a queue holds work waiting for agents.
- 💡 **Pro Tip**: Name workstreams descriptively — e.g., "Billing Chat" rather than "Workstream 1".

---

## Step 004 — Create a Chat workstream

**Action**: Click **+ New workstream** (or **Add workstream**). In the dialog:
- **Name**: `Lab Chat Workstream`
- **Channel type**: Chat
- **Work distribution mode**: Push (default)



### WHY THIS STEP EXISTS
Without a workstream, there is no pipeline for chat conversations to enter. The workstream creates the channel-to-routing bridge.

### HOW IT WORKS
Creating a workstream:
1. Creates a `msdyn_liveworkstream` record in Dataverse
2. Associates it with the Chat channel handler
3. Prepares it to receive classification and routing rulesets
4. Sets the work distribution mode that determines how items flow to agents

```
Chat Widget → Workstream → [Classification] → [Routing] → Queue → Agent
```

- ✅ **Expected Result**: The new workstream dialog opens with fields for name, channel type, and distribution mode.
- ⚠️ **Common Pitfall**: If "Chat" is not available as a channel type, the Omnichannel for Customer Service package may not be installed.
- 💡 **Pro Tip**: "Push" mode auto-assigns to agents. "Pick" mode lets agents choose which items to accept from the queue.

---

## Step 005 — Configure workstream name and channel type

**Action**: Enter the workstream name `Lab Chat Workstream` and confirm **Chat** as the channel type.



### WHY THIS STEP EXISTS
The name identifies this workstream in routing logs, supervisor dashboards, and analytics. The channel type determines which channel adapter processes incoming items.

### HOW IT WORKS
Each channel type has a dedicated adapter that knows how to:
- Accept connections (e.g., chat widget WebSocket)
- Parse incoming messages
- Create a `msdyn_ocliveworkitem` record in Dataverse
- Hand the work item to the Unified Routing pipeline

- ✅ **Expected Result**: Name field populated. Channel type selector shows "Chat" (or "Live chat").
- ⚠️ **Common Pitfall**: UI labels may differ between versions — "Chat", "Live chat", or "Messaging - Live chat" are all the same thing.
- 💡 **Pro Tip**: Record any label variation in `/notes/doc-diffs.md`.

---

## Step 006 — Save the workstream

**Action**: Click **Save** (or **Create**) to persist the workstream.



### WHY THIS STEP EXISTS
Until saved, the workstream exists only in the form's browser state. Saving writes it to Dataverse and makes it available for classification/routing rulesets.

### HOW IT WORKS
On save:
1. A `msdyn_liveworkstream` row is created
2. The system provisions default classification and routing rulesets (empty)
3. The workstream appears in the workstream list and becomes selectable when configuring chat widgets

- ✅ **Expected Result**: Success notification. The workstream detail page loads with sections for classification rules, routing rules, and channel settings.
- ⚠️ **Common Pitfall**: If save fails with a "duplicate name" error, a workstream with this name already exists. Use a unique name.
- 💡 **Pro Tip**: After saving, the page shows the workstream's classification and routing tabs — these are your next targets.

---

## Step 007 — Enable the pre-chat survey

**Action**: In the workstream's **Chat widget** or **Channel** settings, find the **Pre-conversation survey** toggle and turn it **On**.



### WHY THIS STEP EXISTS
The pre-chat survey collects structured input from the customer (like issue category) **before** the conversation is created. This data becomes a context variable that classification rules can evaluate to set skills or priority.

### HOW IT WORKS
When a customer opens the chat widget:
1. The widget renders the pre-chat form (configured questions)
2. Customer fills in answers (e.g., IssueCategory = "Billing")
3. Answers are attached to the work item as **context variables**
4. The work item enters the workstream
5. Classification rules can read these context variables to make routing decisions

```
Customer fills survey → Context variables set → Classification rules evaluate → Skills/priority tagged
```

- ✅ **Expected Result**: The pre-chat survey section expands showing a toggle in the "On" position and a question configuration area.
- ⚠️ **Common Pitfall**: The pre-chat survey toggle location varies — it may be under "Chat widget" settings or directly on the workstream. Check both.
- 💡 **Pro Tip**: Keep surveys short (1–3 questions). Every question adds friction for the customer.

---

## Step 008 — Add IssueCategory pre-chat question

**Action**: Click **Add question** (or **+ New question**). Create:
- **Question name / context variable**: `IssueCategory`
- **Question type**: Choice / Option set
- **Options**: Billing, Hardware, Software, General



### WHY THIS STEP EXISTS
`IssueCategory` is the primary variable that classification rules will use to determine which skill to attach. Without it, the classification ruleset has nothing to evaluate.

### HOW IT WORKS
Each pre-chat question creates a **context variable** on the work item:
- Variable name: `IssueCategory`
- Variable value: whatever the customer selects (e.g., "Billing")

This variable is stored on `msdyn_ocliveworkitemcontextitem` and is accessible to:
- Work classification rules
- Route-to-queue rules
- Agent scripts
- Macros in the agent workspace

- ✅ **Expected Result**: The question appears in the survey list with the configured name, type, and options.
- ⚠️ **Common Pitfall**: The context variable name is case-sensitive. Use `IssueCategory` consistently.
- 💡 **Pro Tip**: You can also set context variables programmatically via the chat SDK if you need data from the host page (e.g., the current URL or customer tier).

---

## Step 009 — Navigate to Skills

**Action**: In the admin center site map, click **User management** → **Skills** (or just **Skills** under routing).



### WHY THIS STEP EXISTS
Skills are the matching criteria between work items and agents. A work item tagged with "Billing" skill will only route to queues/agents that have the "Billing" skill. Without skills defined, you cannot do skills-based routing.

### HOW IT WORKS
Skills in Unified Routing:
- Are defined centrally (not per workstream)
- Have a **type** (Proficiency or Boolean — proficiency allows levels 1–10)
- Are assigned to **agents** (via the user's skill configuration)
- Are set on **work items** by classification rules
- Are matched by **route-to-queue rules** and **assignment rules**

```
Skill "Billing" defined → Assigned to Agent A (proficiency: 8) → Work item classified with "Billing" → Routed to queue requiring "Billing" → Agent A matched
```

- ✅ **Expected Result**: The Skills list page loads, showing existing skills or an empty list.
- ⚠️ **Common Pitfall**: Skills vs. characteristics — in some documentation these terms are used interchangeably. They are the same thing.
- 💡 **Pro Tip**: Plan your skills taxonomy before creating them. Too many fine-grained skills make routing rigid; too few make it meaningless.

---

## Step 010 — Create a new skill

**Action**: Click **+ New skill** (or **Add skill**). Enter:
- **Name**: `Billing`
- **Type**: Proficiency (or Boolean, depending on your scenario)



### WHY THIS STEP EXISTS
This creates the "Billing" skill that will be used in classification rules (to tag incoming billing requests) and in routing rules (to match to the billing queue).

### HOW IT WORKS
A skill record (`msdyn_characteristicreqgroup` or `characteristic`) is created in Dataverse. It can then be:
1. **Attached to agents** — via User → Skills, with a proficiency level
2. **Set on work items** — via work classification rules
3. **Matched in routing** — via route-to-queue rules that filter by required skills

- ✅ **Expected Result**: The new skill form opens with name and type fields.
- ⚠️ **Common Pitfall**: Skill names cannot be changed after agents and rules reference them. Choose names carefully.
- 💡 **Pro Tip**: Use proficiency type if you want tiered routing (e.g., junior agents handle simple billing, senior agents handle complex billing).

---

## Step 011 — Configure and save the skill

**Action**: Fill in `Billing` as the skill name. Select the type. Click **Save**.



### WHY THIS STEP EXISTS
The skill must be saved to Dataverse before it can be referenced in classification rules, routing rules, or agent assignments.

### HOW IT WORKS
On save, the skill becomes available system-wide. You can now:
- Assign it to agents (with proficiency levels)
- Reference it in work classification rules ("if IssueCategory = Billing, set Billing skill")
- Use it in route-to-queue rules ("if Billing skill is present, route to Billing queue")

- ✅ **Expected Result**: Skill saved. You're returned to the skills list or the skill detail page.
- ⚠️ **Common Pitfall**: If you plan additional skills (e.g., "Hardware", "Software"), create them now. Repeat steps 010–011 for each.
- 💡 **Pro Tip**: Create at least 2 skills to demonstrate differential routing in the validation step.

---

## Step 012 — Save skill and optionally create additional skills

**Action**: If needed, repeat skill creation for `Hardware`, `Software`, or other categories matching your pre-chat survey options.



### WHY THIS STEP EXISTS
Each IssueCategory option should have a corresponding skill so that classification rules can map category → skill → queue.

### HOW IT WORKS
Multiple skills create more routing paths:
```
IssueCategory = Billing   → Billing skill   → Billing Queue
IssueCategory = Hardware  → Hardware skill   → Hardware Queue
IssueCategory = Software  → Software skill   → General Queue (fallback)
```

- ✅ **Expected Result**: Multiple skills visible in the skills list.
- ⚠️ **Common Pitfall**: Don't forget to assign these skills to agents later, or work items will wait in queues with no eligible agents.
- 💡 **Pro Tip**: You can also assign skills to agents in bulk via the admin center's user management page.

---

## Step 013 — Navigate to Work classification rules

**Action**: Go back to **Workstreams** → click **Lab Chat Workstream** → scroll to the **Work classification** section (or tab).



### WHY THIS STEP EXISTS
Work classification rules are evaluated **before routing**. They read work item context (like IssueCategory from the pre-chat survey) and tag the work item with skills, priority, or other attributes.

### HOW IT WORKS
Classification happens immediately after the work item enters the workstream:
```
Work item created (with context variables)
  → Classification ruleset evaluates
    → Rule 1: if IssueCategory = Billing → set Billing skill
    → Rule 2: if IssueCategory = Hardware → set Hardware skill
    → (fallback: no skill set → default routing)
  → Work item now has skills attached
  → Passes to route-to-queue rules
```

Each ruleset can contain multiple rules. Rules are evaluated in order. Multiple rules can fire (and set multiple skills).

- ✅ **Expected Result**: The workstream page shows a "Work classification" section, possibly with a "Create ruleset" or existing rules area.
- ⚠️ **Common Pitfall**: Classification rules are per-workstream, not global. Each workstream has its own ruleset.
- 💡 **Pro Tip**: Use "Logical rules" (not ML rules) for deterministic behavior in labs. ML classification is a separate feature requiring training data.

---

## Step 014 — Create a work classification rule

**Action**: In the Work classification section, click **Create rule** (or **+ New rule**). Enter:
- **Rule name**: `Set Billing Skill`



### WHY THIS STEP EXISTS
This rule will evaluate the `IssueCategory` context variable from the pre-chat survey and set the `Billing` skill on the work item when the customer selects "Billing".

### HOW IT WORKS
A classification rule consists of:
1. **Conditions** — logical expressions (e.g., `IssueCategory equals Billing`)
2. **Actions** — what to set on the work item (e.g., set skill = Billing)

The rule engine evaluates conditions at runtime using the work item's context variables.

- ✅ **Expected Result**: A new rule form/dialog opens with fields for rule name, conditions, and actions.
- ⚠️ **Common Pitfall**: Condition operators vary by field type. For choice fields, use "equals" with the exact option value text.
- 💡 **Pro Tip**: Give rules descriptive names — you'll see them in diagnostic reports when troubleshooting routing.

---

## Step 015 — Configure rule: IssueCategory = Billing → Set Billing skill

**Action**: Configure the rule conditions and action:
- **Condition**: Context variable `IssueCategory` **equals** `Billing`
- **Action**: Set skill → `Billing` (proficiency: required or specific level)



### WHY THIS STEP EXISTS
This is the actual routing intelligence — the logic that translates customer input into routing attributes.

### HOW IT WORKS
At runtime, when a customer selects "Billing" in the pre-chat survey:
1. Work item context variable `IssueCategory` = "Billing"
2. Classification engine evaluates this rule
3. Condition matches → action fires
4. `Billing` skill is attached to the work item
5. The work item now carries this skill into the route-to-queue evaluation

```
[IssueCategory = "Billing"] → MATCH → [Set skill: Billing] → Work item tagged
```

- ✅ **Expected Result**: The rule shows the condition and action configured correctly.
- ⚠️ **Common Pitfall**: Context variable names are case-sensitive. Ensure `IssueCategory` matches exactly what you configured in the pre-chat survey.
- 💡 **Pro Tip**: You can add multiple conditions (AND/OR) and multiple actions per rule.

---

## Step 016 — Save the classification rule

**Action**: Click **Save** to persist the classification rule.



### WHY THIS STEP EXISTS
The rule must be saved to become active. Unsaved rules don't participate in classification.

### HOW IT WORKS
On save, the rule is stored in `msdyn_decisionruleset` / `msdyn_decisionrule` Dataverse tables. The next time a work item enters this workstream, the classification engine will include this rule in its evaluation.

- ✅ **Expected Result**: Success notification. The rule appears in the classification rules list.
- ⚠️ **Common Pitfall**: Rules with syntax errors may save but fail at evaluation time. Test via the validation step.
- 💡 **Pro Tip**: Create additional classification rules for other categories (Hardware, Software) to complete the routing matrix.

---

## Step 017 — Navigate to Route-to-queue rules

**Action**: Still in the workstream, scroll to (or click on) the **Route to queues** section.



### WHY THIS STEP EXISTS
After classification tags the work item with skills, route-to-queue rules determine **which queue** receives the work item. Without these rules, work items go to the default (fallback) queue.

### HOW IT WORKS
Route-to-queue rules run **after** classification:
```
Work item (with skills attached)
  → Route-to-queue ruleset evaluates
    → Rule 1: if Billing skill → Billing Queue
    → Rule 2: if Hardware skill → Hardware Queue
    → (fallback: Default Queue)
  → Work item placed in matched queue
```

Queue assignment is the critical routing decision — it determines which pool of agents can handle the item.

- ✅ **Expected Result**: The route-to-queue section shows existing rules or an empty area with "Create rule" option.
- ⚠️ **Common Pitfall**: Don't confuse route-to-queue rules with assignment rules. Route-to-queue picks the queue; assignment (inside the queue) picks the agent.
- 💡 **Pro Tip**: Always configure a fallback queue so that unmatched items aren't stuck indefinitely.

---

## Step 018 — Create a route-to-queue rule

**Action**: Click **Create rule** (or **+ New rule**). Enter:
- **Rule name**: `Route Billing to Billing Queue`


### WHY THIS STEP EXISTS
This rule creates the link between the "Billing" skill (set by classification) and the "Billing Queue" where billing-skilled agents work.

### HOW IT WORKS
The rule matches on the work item's attached skills and routes to a specific queue:
```
[Work item has Billing skill] → Route to Billing Queue
```

The queue must already exist (or be created inline if the UI supports it).

- ✅ **Expected Result**: New rule form opens with condition and queue selection fields.
- ⚠️ **Common Pitfall**: The queue must exist before you can select it in the rule. Create queues first if they don't exist.
- 💡 **Pro Tip**: Use the same naming convention for rules, skills, and queues — it makes the routing chain easy to follow.

---

## Step 019 — Configure queue routing conditions

**Action**: Set the condition:
- **Condition**: Skill → `Billing` matches or is present
- **Queue**: Select the `Billing Queue` (create it if it doesn't exist)



### WHY THIS STEP EXISTS
The condition creates the logical gate: "If this work item has the Billing skill, send it to the Billing queue."

### HOW IT WORKS
At runtime:
1. Route-to-queue engine reads the work item's skill tags
2. Evaluates this rule's conditions against those tags
3. If **Billing** skill is present → the action fires
4. Work item is assigned to **Billing Queue**
5. Within the queue, **assignment rules** determine which agent gets it

- ✅ **Expected Result**: The rule form shows the skill condition and target queue selected.
- ⚠️ **Common Pitfall**: If you use proficiency-based matching, ensure the condition specifies a minimum proficiency level.
- 💡 **Pro Tip**: Multiple route-to-queue rules are evaluated in order. Put more specific rules first, and the fallback last.

---

## Step 020 — Save the route-to-queue rule

**Action**: Click **Save**.



### WHY THIS STEP EXISTS
Persists the routing rule so it's active for all future work items.

### HOW IT WORKS
On save, the rule joins the active route-to-queue ruleset. For every new work item:
1. Classification runs → skills attached
2. Route-to-queue runs → this rule evaluates → queue determined
3. Assignment runs → agent selected within the queue

- ✅ **Expected Result**: Rule saved successfully. Visible in the route-to-queue rules list.
- ⚠️ **Common Pitfall**: If you create multiple rules, check their **order**. The first matching rule wins (in some configurations).
- 💡 **Pro Tip**: Use the **Diagnostics** feature (if available) to trace how a work item is routed after you test.

---

## Step 021 — Validate: Open chat widget

**Action**: Open a page with the chat widget embedded (your portal, test page, or the widget preview in admin center). Click the chat button.



### WHY THIS STEP EXISTS
End-to-end validation proves that the entire routing pipeline works: survey → classification → routing → queue → agent.

### HOW IT WORKS
When the customer clicks the chat button:
1. Chat widget loads
2. Pre-chat survey form appears (because we enabled it)
3. Customer fills in `IssueCategory`
4. Chat session is created → work item starts its journey through the pipeline

- ✅ **Expected Result**: The chat widget opens and displays the pre-chat survey form with the IssueCategory question.
- ⚠️ **Common Pitfall**: If the widget doesn't appear, verify the chat widget is published and the workstream is active.
- 💡 **Pro Tip**: Use a browser incognito window for the customer side and a separate browser for the agent side.

---

## Step 022 — Submit pre-chat survey

**Action**: Select an IssueCategory (e.g., `Billing`) in the pre-chat survey and submit.



### WHY THIS STEP EXISTS
Submitting the survey sends the context variable to the workstream, triggering the classification → routing chain.

### HOW IT WORKS
1. Survey answer `IssueCategory = Billing` becomes a context variable
2. Work item enters the `Lab Chat Workstream`
3. Classification rule evaluates: IssueCategory = Billing → set Billing skill
4. Route-to-queue rule evaluates: Billing skill → Billing Queue
5. Assignment rule evaluates: which agent in this queue has capacity and matching skills?

- ✅ **Expected Result**: Survey submits. Chat transitions to "connecting to an agent" or "waiting for an agent" state.
- ⚠️ **Common Pitfall**: If the chat immediately connects to the default queue agent, classification rules may not be firing. Check rule conditions.
- 💡 **Pro Tip**: Watch the Omnichannel Ongoing Conversations dashboard (supervisor view) to see the work item's queue in real-time.

---

## Step 023 — Accept work item in Agent workspace

**Action**: In a separate browser (logged in as an agent), open **Customer Service workspace**. When the work item notification appears, click **Accept**.



### WHY THIS STEP EXISTS
This confirms that the assignment engine selected the correct agent (one with the Billing skill, in the Billing queue, with available capacity).

### HOW IT WORKS
Assignment evaluation:
1. Work item is in the Billing Queue
2. The queue's assignment rules identify eligible agents (those with Billing skill + available capacity)
3. Based on the assignment method (Round Robin, most idle, etc.), one agent is selected
4. A push notification appears in the agent's workspace
5. Agent accepts → conversation session opens

- ✅ **Expected Result**: The notification appears. After accepting, a new session tab opens with the customer conversation.
- ⚠️ **Common Pitfall**: If no notification appears, verify the agent user has the Billing skill assigned and has available capacity/presence set to "Available".
- 💡 **Pro Tip**: Set the agent's presence to "Available" and ensure capacity profile allows at least 1 concurrent chat before testing.

---

## Step 024 — Verify routing context in workspace

**Action**: In the open conversation, check the **Customer summary** or **Conversation details** panel. Verify:
- Queue: Billing Queue
- Skills: Billing
- Survey answers: IssueCategory = Billing



### WHY THIS STEP EXISTS
This is the final proof that the entire pipeline worked correctly. The agent can see exactly how and why the conversation was routed to them.

### HOW IT WORKS
The agent workspace displays:
- **Queue** the work item was routed to
- **Skills** that were set by classification
- **Pre-chat survey answers** from the customer
- **Routing diagnostics** (if enabled) showing which rules fired

This information comes from the work item's Dataverse record (`msdyn_ocliveworkitem`) and its associated context items.

- ✅ **Expected Result**: The conversation panel shows the correct queue, skills, and pre-chat answers matching the customer's selection.
- ⚠️ **Common Pitfall**: If skills show as empty but the queue is correct, classification rules may have failed silently. Check the rule conditions against the actual context variable name.
- 💡 **Pro Tip**: Enable **Routing diagnostics** in admin center for detailed step-by-step trace of every routing decision.

---

## Summary

You have now configured the complete Unified Routing pipeline:

| Component | Configuration |
|---|---|
| Workstream | `Lab Chat Workstream` (Chat channel) |
| Pre-chat survey | `IssueCategory` (Billing, Hardware, Software, General) |
| Skills | `Billing` (and optionally Hardware, Software) |
| Classification rule | `IssueCategory = Billing → Set Billing skill` |
| Route-to-queue rule | `Billing skill → Billing Queue` |
| Validation | End-to-end test via chat widget → agent workspace |

Every incoming chat conversation now flows through:
```
Customer → Pre-chat survey → Classification → Skills tagged → Route-to-queue → Assignment → Agent workspace
```
