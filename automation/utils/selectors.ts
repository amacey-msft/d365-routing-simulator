/**
 * Centralized selectors for Power Platform and D365 admin portals.
 *
 * Selectors are organized by page/area. These may change between
 * platform releases — update here when UI changes.
 */

export const selectors = {
  // Power Platform Admin Center
  ppac: {
    environmentList: '[data-testid="environment-list"], .environment-list',
    environmentCard: (name: string) =>
      `text=${name}`,
    settingsLink: 'text=Settings',
  },

  // Customer Service admin center
  csAdmin: {
    siteMap: '.ms-Nav',
    workstreamsLink: 'text=Workstreams',
    queuesLink: 'text=Queues',
    skillsLink: 'text=Skills',
    routingLink: 'text=Routing',
    unifiedRoutingLink: 'text=Unified routing',

    // Workstream
    newWorkstreamBtn: 'button:has-text("New workstream"), button:has-text("Add workstream")',
    workstreamNameInput: 'input[aria-label*="Name"], input[placeholder*="Name"]',
    channelTypeDropdown: '[aria-label*="Channel type"], [aria-label*="Type"]',
    chatChannelOption: 'text=Chat, option:has-text("Chat")',
    saveBtn: 'button:has-text("Save"), button[aria-label="Save"]',

    // Pre-chat survey
    preChatSurveyToggle: '[aria-label*="Pre-conversation survey"], [aria-label*="Pre-chat"]',
    addQuestionBtn: 'button:has-text("Add question"), button:has-text("New question")',
    questionNameInput: 'input[aria-label*="Question name"], input[placeholder*="question"]',
    questionTypeDropdown: '[aria-label*="Question type"], [aria-label*="Answer type"]',

    // Skills
    newSkillBtn: 'button:has-text("New skill"), button:has-text("Add skill")',
    skillNameInput: 'input[aria-label*="Name"]',
    skillTypeDropdown: '[aria-label*="Type"]',

    // Work classification
    classificationRulesetLink: 'text=Work classification',
    newRuleBtn: 'button:has-text("Create rule"), button:has-text("New rule")',
    ruleNameInput: 'input[aria-label*="Rule name"], input[aria-label*="Name"]',
    conditionDropdown: '[aria-label*="Condition"]',
    setSkillAction: 'text=Set skill',

    // Route-to-queue
    routeToQueueLink: 'text=Route to queues',
    newRouteRuleBtn: 'button:has-text("Create rule"), button:has-text("New rule")',
    queueDropdown: '[aria-label*="Queue"]',
  },

  // Chat widget / validation
  chatWidget: {
    chatButton: '[aria-label*="Chat"], .oc-chat-button, #Microsoft_Omnichannel_LCWidget_Chat_Iframe_Window',
    preChatForm: '.pre-chat-survey, [data-testid="pre-chat"]',
    sendBtn: 'button[aria-label*="Send"]',
    messageInput: 'textarea, input[aria-label*="Type a message"]',
  },

  // Agent workspace
  workspace: {
    sessionTab: '.session-panel, [data-testid="session-tab"]',
    activeConversation: '.active-conversation, [data-testid="conversation"]',
    acceptBtn: 'button:has-text("Accept"), button[aria-label="Accept"]',
  },
};
