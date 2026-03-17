/**
 * Dataverse Web API client for querying D365 Contact Center routing configuration.
 * Supports two auth modes:
 *   1. MSAL.js interactive login (requires Entra app registration)
 *   2. Bearer token paste (no setup — copy token from browser dev tools)
 */
var DataverseClient = (function () {
  'use strict';

  var _orgUrl = null;   // e.g. https://org7ef5c70f.crm.dynamics.com
  var _token = null;
  var _msalInstance = null;
  var _msalAccount = null;

  // Well-known: Power Apps first-party multi-tenant client ID.
  // Replace with your own Entra SPA app registration if needed.
  var DEFAULT_CLIENT_ID = '51f81489-12ee-4a9e-aaae-a2591f45987d';

  // ── Helpers ──

  function apiUrl(path) {
    return _orgUrl.replace(/\/+$/, '') + '/api/data/v9.2/' + path;
  }

  function headers() {
    return {
      'Authorization': 'Bearer ' + _token,
      'Accept': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Prefer': 'odata.include-annotations="*"'
    };
  }

  async function query(entitySet, select, filter, top, expand) {
    var parts = ['$select=' + select];
    if (filter) parts.push('$filter=' + filter);
    if (top) parts.push('$top=' + top);
    if (expand) parts.push('$expand=' + expand);
    var url = apiUrl(entitySet + '?' + parts.join('&'));
    var resp = await fetch(url, { headers: headers() });
    if (!resp.ok) {
      var body = '';
      try { body = await resp.text(); } catch (_) {}
      throw new Error('Dataverse API ' + resp.status + ': ' + body.substring(0, 300));
    }
    var data = await resp.json();
    return data.value || [];
  }

  // ── Auth: MSAL interactive ──

  async function loginMsal(orgUrl, clientId) {
    if (typeof msal === 'undefined') {
      throw new Error('MSAL.js not loaded. Include the CDN script tag for @azure/msal-browser.');
    }
    _orgUrl = orgUrl.replace(/\/+$/, '');
    var cid = clientId || DEFAULT_CLIENT_ID;
    var authority = 'https://login.microsoftonline.com/common';

    _msalInstance = new msal.PublicClientApplication({
      auth: { clientId: cid, authority: authority, redirectUri: window.location.origin + window.location.pathname },
      cache: { cacheLocation: 'sessionStorage' }
    });
    await _msalInstance.initialize();

    // Try silent first (cached session)
    var accounts = _msalInstance.getAllAccounts();
    var tokenRequest = { scopes: [_orgUrl + '/.default'] };
    if (accounts.length > 0) {
      tokenRequest.account = accounts[0];
      try {
        var silentResult = await _msalInstance.acquireTokenSilent(tokenRequest);
        _token = silentResult.accessToken;
        _msalAccount = silentResult.account;
        return { user: _msalAccount.username, method: 'msal-silent' };
      } catch (_) { /* fall through to interactive */ }
    }

    // Interactive popup
    var result = await _msalInstance.acquireTokenPopup(tokenRequest);
    _token = result.accessToken;
    _msalAccount = result.account;
    return { user: _msalAccount.username, method: 'msal-popup' };
  }

  // ── Auth: Token paste ──

  function loginToken(orgUrl, token) {
    _orgUrl = orgUrl.replace(/\/+$/, '');
    _token = token.trim();
    return { user: '(token auth)', method: 'token-paste' };
  }

  // ── Connectivity test ──

  async function testConnection() {
    var resp = await fetch(apiUrl('WhoAmI()'), { headers: headers() });
    if (!resp.ok) throw new Error('WhoAmI failed: ' + resp.status);
    return resp.json();
  }

  // ── Query routing configuration ──

  /** Omnichannel queues (messaging, record, voice) */
  async function getQueues() {
    // msdyn_queuetype: 192350000=Messaging, 192350001=Record, 192350002=Voice
    // queueviewtype 0 = public queues
    var rows = await query(
      'queues',
      'name,queueid,msdyn_queuetype,msdyn_priority,msdyn_isdefaultqueue,msdyn_isomnichannelqueue',
      'msdyn_isomnichannelqueue eq true',
      50
    );
    return rows.map(function (r) {
      var typeLabel = { 192350000: 'Messaging', 192350001: 'Record', 192350002: 'Voice' };
      return {
        id: r.queueid,
        name: r.name,
        type: typeLabel[r.msdyn_queuetype] || 'Unknown',
        priority: r.msdyn_priority,
        isDefault: r.msdyn_isdefaultqueue === true
      };
    });
  }

  /** Skills (characteristics with type = Skill) */
  async function getSkills() {
    // characteristictype: 1=Skill, 2=Certification
    var rows = await query(
      'characteristics',
      'name,characteristicid,characteristictype',
      'characteristictype eq 1',
      100
    );
    return rows.map(function (r) {
      return { id: r.characteristicid, name: r.name };
    });
  }

  /** Workstreams */
  async function getWorkstreams() {
    var rows = await query(
      'msdyn_liveworkstreams',
      'msdyn_name,msdyn_liveworkstreamid,msdyn_mode,msdyn_streamsource',
      null,
      50
    );
    // msdyn_mode: 0=Push, 1=Pick
    // msdyn_streamsource: many values — 192360000=Chat, 192370000=SMS, etc.
    var sourceMap = {
      192360000: 'Chat', 192370000: 'SMS', 192380000: 'Facebook',
      192390000: 'Voice', 192400000: 'Teams', 192350000: 'Entity Records',
      192450000: 'WhatsApp', 192440000: 'Apple Messages'
    };
    return rows.map(function (r) {
      return {
        id: r.msdyn_liveworkstreamid,
        name: r.msdyn_name,
        mode: r.msdyn_mode === 0 ? 'Push' : 'Pick',
        channel: sourceMap[r.msdyn_streamsource] || 'Other (' + r.msdyn_streamsource + ')'
      };
    });
  }

  /** Bookable resources (agents / reps) with their characteristics */
  async function getAgents() {
    // resourcetype: 3 = User
    var resources = await query(
      'bookableresources',
      'name,bookableresourceid,resourcetype',
      'resourcetype eq 3',
      50
    );

    // Get skill associations
    var skillLinks = await query(
      'bookableresourcecharacteristics',
      'bookableresourcecharacteristicid',
      null,
      200,
      'CharacteristicId($select=name),BookableResourceId($select=name,bookableresourceid)'
    );

    // Build skill map per resource
    var skillMap = {};
    skillLinks.forEach(function (sl) {
      if (!sl.CharacteristicId || !sl.BookableResourceId) return;
      var rid = sl.BookableResourceId.bookableresourceid;
      if (!skillMap[rid]) skillMap[rid] = [];
      skillMap[rid].push(sl.CharacteristicId.name);
    });

    return resources.map(function (r) {
      return {
        id: r.bookableresourceid,
        name: r.name,
        skills: skillMap[r.bookableresourceid] || []
      };
    });
  }

  /** Capacity profiles */
  async function getCapacityProfiles() {
    var rows = await query(
      'msdyn_capacityprofiles',
      'msdyn_name,msdyn_capacityprofileid,msdyn_defaultmaxunits,msdyn_resetfrequency',
      null,
      50
    );
    // msdyn_resetfrequency: 0=Immediate, 1=EndOfDay
    return rows.map(function (r) {
      return {
        id: r.msdyn_capacityprofileid,
        name: r.msdyn_name,
        maxUnits: r.msdyn_defaultmaxunits,
        reset: r.msdyn_resetfrequency === 0 ? 'Immediate' : 'End of day'
      };
    });
  }

  /** Classification rulesets */
  async function getRulesets() {
    var rows = await query(
      'msdyn_decisionrulesets',
      'msdyn_name,msdyn_decisionrulesetid,msdyn_rulesettype',
      null,
      50
    );
    return rows.map(function (r) {
      return {
        id: r.msdyn_decisionrulesetid,
        name: r.msdyn_name,
        type: r.msdyn_rulesettype
      };
    });
  }

  /** Fetch everything in parallel */
  async function fetchAllConfig() {
    var results = await Promise.allSettled([
      getQueues(),
      getSkills(),
      getWorkstreams(),
      getAgents(),
      getCapacityProfiles(),
      getRulesets()
    ]);

    function val(r) { return r.status === 'fulfilled' ? r.value : []; }
    function err(r) { return r.status === 'rejected' ? r.reason.message : null; }

    return {
      queues: val(results[0]),
      skills: val(results[1]),
      workstreams: val(results[2]),
      agents: val(results[3]),
      capacityProfiles: val(results[4]),
      rulesets: val(results[5]),
      errors: [err(results[0]), err(results[1]), err(results[2]),
               err(results[3]), err(results[4]), err(results[5])].filter(Boolean)
    };
  }

  // ── Public API ──

  return {
    loginMsal: loginMsal,
    loginToken: loginToken,
    testConnection: testConnection,
    getQueues: getQueues,
    getSkills: getSkills,
    getWorkstreams: getWorkstreams,
    getAgents: getAgents,
    getCapacityProfiles: getCapacityProfiles,
    getRulesets: getRulesets,
    fetchAllConfig: fetchAllConfig,
    get orgUrl() { return _orgUrl; },
    get isConnected() { return !!_token; }
  };
})();
