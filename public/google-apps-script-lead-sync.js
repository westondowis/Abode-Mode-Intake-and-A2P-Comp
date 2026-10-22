/**
 * ==============================================================================
 * ABODE MODE (abodebuys.com / abode-mode.com) - ZERO-COST GOOGLE LEAD SYNC ENGINE
 * ==============================================================================
 * 
 * 100% Free Google Workspace Automation (No Zapier / Make / Cloud hosting fees)
 * 
 * CAPABILITIES:
 * 1. Google Sheets: Appends every inbound lead (Seller or Buyer) to your Google Sheet in real time.
 * 2. Gmail Alert: Sends an instant formatted lead dossier email to wdowis@abode-mode.com.
 * 3. Google Tasks: Automatically creates a task titled:
 *    "Input Lead into CRM: [FullName] - [Property Address]"
 *    with a deep link to the Gmail alert and a formatted CRM clipboard block ready to paste.
 * 
 * QUICK SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet (e.g., "Abode Mode Inbound Leads Master").
 * 2. Click "Extensions" > "Apps Script".
 * 3. In the left sidebar under "Services", click the "+" icon, select "Tasks API", and click "Add".
 * 4. Paste this entire file into Code.gs, replacing any existing code.
 * 5. Click "Deploy" > "New deployment".
 * 6. Select type: "Web app".
 * 7. Set:
 *    - Description: "Abode Mode Inbound Lead Webhook"
 *    - Execute as: "Me (your Google email)"
 *    - Who has access: "Anyone" (allows the web form to POST leads)
 * 8. Click "Deploy", authorize permissions when prompted, and copy the Web App URL.
 * 9. Paste the Web App URL into the "Sheets Sync" hub inside Abode Mode or set VITE_APPS_SCRIPT_URL.
 * ==============================================================================
 */

// Target email for notifications
var ACQUISITION_NOTIFICATION_EMAIL = "wdowis@abode-mode.com";

/**
 * HTTP POST Handler for incoming lead submissions from Abode Mode
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // 1. Ensure Header Row exists in active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    setupSheetHeadersIfNeeded(sheet);

    // 2. Append lead row
    var timestamp = new Date().toISOString();
    var leadId = data.id || ("ABODE-" + Date.now().toString(36).toUpperCase());
    var flow = (data.flow === "buy") ? "BUYER CRITERIA" : "SELLER ACQUISITION";
    var fullName = data.fullName || "Unknown";
    var phone = data.phone || "N/A";
    var email = data.email || "N/A";
    var propertyAddress = data.propertyAddress || data.parcelOrAddress || data.parcelNumber || "N/A";
    var county = data.county || "N/A";
    var state = data.state || "N/A";
    var acreage = data.acreage || "N/A";
    var askingPrice = data.askingPrice || "N/A";
    var motivation = data.motivation || "N/A";
    var timeline = data.timeline || "N/A";
    var condition = data.occupancyCondition || "N/A";
    var notes = data.notes || "None";
    
    // A2P 10DLC compliance fields
    var txConsent = (data.smsTransactionalConsent || data.smsConsentTransactional) ? "YES" : "NO";
    var mktConsent = (data.smsMarketingConsent || data.smsConsentMarketing) ? "YES" : "NO";
    var consentTimestamp = data.consentTimestamp || "N/A";
    var clientIp = data.consentIpHint || "client-web";
    var userAgent = data.userAgent || "AbodeMode-Web/1.0";

    sheet.appendRow([
      timestamp,
      leadId,
      flow,
      fullName,
      phone,
      email,
      propertyAddress,
      county,
      state,
      acreage,
      askingPrice,
      motivation,
      timeline,
      condition,
      txConsent,
      mktConsent,
      consentTimestamp,
      clientIp,
      notes
    ]);

    // 3. Dispatch Instant Gmail Notification to Acquisition Desk
    var emailSubject = "🔔 New " + flow + ": " + fullName + " - " + propertyAddress;
    var gmailSearchUrl = "https://mail.google.com/mail/u/0/#search/" + encodeURIComponent(leadId);

    var crmBlock = [
      "============================================================",
      "📋 ABODE MODE - CRM INTAKE CLIPBOARD BLOCK",
      "------------------------------------------------------------",
      "Lead ID:          " + leadId,
      "Intake Flow:      " + flow,
      "Submitted At:     " + new Date().toLocaleString(),
      "",
      "CONTACT DETAILS:",
      "Full Name:        " + fullName,
      "Phone:            " + phone,
      "Email:            " + email,
      "",
      "PROPERTY / PARCEL:",
      "Address / APN:    " + propertyAddress,
      "County & State:   " + county + ", " + state,
      "Acreage:          " + acreage,
      "",
      "DEAL TERMS & MOTIVATION:",
      "Asking / Budget:  " + askingPrice,
      "Timeline:         " + timeline,
      "Motivation / Use: " + motivation,
      "Condition/Status: " + condition,
      "Additional Notes: " + notes,
      "",
      "A2P 10DLC COMPLIANCE RECORD:",
      "SMS Tx Consent:   " + txConsent,
      "SMS Mkt Consent:  " + mktConsent,
      "Consent Time:     " + consentTimestamp,
      "IP Hint / Agent:  " + clientIp + " (" + userAgent + ")",
      "============================================================"
    ].join("\n");

    var emailBody = [
      "Hello William,",
      "",
      "A new inbound lead was submitted through Abode Mode (abode-mode.com).",
      "",
      crmBlock,
      "",
      "🔗 Direct Gmail Search Link for this Lead: " + gmailSearchUrl,
      "",
      "A Google Task has been automatically added to your CRM action queue.",
      "",
      "— Abode Mode Inbound Lead Automation"
    ].join("\n");

    try {
      GmailApp.sendEmail(ACQUISITION_NOTIFICATION_EMAIL, emailSubject, emailBody, {
        name: "Abode Mode Acquisitions"
      });
    } catch (mailErr) {
      Logger.log("Email dispatch failed: " + mailErr);
    }

    // 4. Create Google Task with direct link and CRM block in task notes
    try {
      if (typeof Tasks !== "undefined" && Tasks.Tasks) {
        var taskTitle = "Input Lead into CRM: " + fullName + " - " + propertyAddress;
        var taskNotes = [
          "Action: Transfer this lead into your CRM.",
          "",
          "🔗 Direct Email Link: " + gmailSearchUrl,
          "",
          crmBlock
        ].join("\n");

        Tasks.Tasks.insert(
          {
            title: taskTitle,
            notes: taskNotes,
            due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Due in 24 hours
          },
          "@default"
        );
      }
    } catch (taskErr) {
      Logger.log("Google Task creation failed (check Tasks API service): " + taskErr);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      leadId: leadId,
      message: "Lead persisted to Google Sheet, Gmail alert dispatched, and Google Task generated."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * HTTP GET for health checks & webhook verification
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "Abode Mode Google Sheets & Tasks Sync Webhook",
    recipient: ACQUISITION_NOTIFICATION_EMAIL,
    instructions: "POST JSON lead payload to this URL to sync."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Creates formatted column headers on the active sheet if empty
 */
function setupSheetHeadersIfNeeded(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp (UTC)",
      "Lead ID",
      "Flow Type",
      "Full Name",
      "Phone",
      "Email",
      "Property Address / APN",
      "County",
      "State",
      "Acreage",
      "Asking / Budget Price",
      "Motivation / Intended Use",
      "Timeline",
      "Condition / Status",
      "SMS Tx Consent",
      "SMS Mkt Consent",
      "Consent Timestamp",
      "Client IP Hint",
      "Notes"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0A4251");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
}
