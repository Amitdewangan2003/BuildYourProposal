import { uid } from "../utils/helpers";
import { createTableData } from "../utils/tableUtils";
import type { Section } from "../types/document";

export function buildDefaultSections(): Section[] {
  const hdr = { backgroundColor: "#1a2e4a", color: "#ffffff", fontWeight: "600" };

  const moduleOverview = createTableData(10, 4);
  moduleOverview[0][0] = { value: "Category", style: hdr };
  moduleOverview[0][1] = { value: "Module Type", style: hdr };
  moduleOverview[0][2] = { value: "Module Name", style: hdr };
  moduleOverview[0][3] = { value: "Remark", style: hdr };

  const projectCost = createTableData(3, 6);
  projectCost[0][0] = { value: "Product/Service", style: hdr };
  projectCost[0][1] = { value: "Type", style: hdr };
  projectCost[0][2] = { value: "Management Front post delivery", style: hdr };
  projectCost[0][3] = { value: "Delivery Timeline", style: hdr };
  projectCost[0][4] = { value: "Paid Support", style: hdr };
  projectCost[0][5] = { value: "Cost", style: hdr };

  const recurringCost = createTableData(3, 6);
  recurringCost[0][0] = { value: "Product/Service", style: hdr };
  recurringCost[0][1] = { value: "Page Load", style: hdr };
  recurringCost[0][2] = { value: "Type", style: hdr };
  recurringCost[0][3] = { value: "Management Front", style: hdr };
  recurringCost[0][4] = { value: "Delivery Timeline", style: hdr };
  recurringCost[0][5] = { value: "Cost", style: hdr };

  const paymentTerms = createTableData(3, 5);
  paymentTerms[0][0] = { value: "Installment", style: hdr };
  paymentTerms[0][1] = { value: "TimeLine", style: hdr };
  paymentTerms[0][2] = { value: "%", style: hdr };
  paymentTerms[0][3] = { value: "Amount", style: hdr };
  paymentTerms[0][4] = { value: "Balance", style: hdr };

  return [
    {
      id: uid(),
      type: "text",
      title: "Introduction",
      content: `This document consists of details discussed during in-person meeting on Feb 27, 2026, to understand the requirement for an application. On broad level the requirement is explained by you in three different business processes, Sale, Rent and Repair including accounts and stock modules. Below are the key notes we documented during the discussion followed by detailed modules, technicals, cost and timeline.`,
    },
    {
      id: uid(),
      type: "text",
      title: "Key Notes",
      content: `<ol><li>Master's for managing static entries</li><li>Independent three process for pre-defined workflow</li><li>Transportation of goods will be included, and partial delivery is also in place<ul><li>The transportation commission will be excluded from delivery challan format and print</li></ul></li><li>Inventory management with reporting</li><li>Account module for maintaining ledgers, P/L report and balance sheet</li></ol>`,
    },
    {
      id: uid(),
      type: "text",
      title: "Attribution",
      content: `This document has been produced by Augmentuss Automations LLP, offering solution advice &amp; support for SJR Trading Co. (Raipur). Following modules will be considered and locked for development. In case of any change, another revised version can be shared.`,
    },
    { id: uid(), type: "table", title: "Module Overview", data: moduleOverview },
    {
      id: uid(),
      type: "text",
      title: "Cost Overview",
      content: `We are considering module requirements as mentioned above. Project Cost break-up Details: GST Not Included (Tax as applicable). Recurring cost/year as mentioned in the table below.`,
    },
    { id: uid(), type: "table", title: "Project Cost", data: projectCost },
    { id: uid(), type: "table", title: "Recurring Cost", data: recurringCost },
    {
      id: uid(),
      type: "text",
      title: "Concluding Terms",
      content: `<b>Concluding Terms:</b><br>- This Agreement will not be modified or get amended except by written notice signed by authorized representatives of each party.<br>- Domain Purchase/Transfer cost is not included in this proposal.<br>- Additional Modules / Reports / Features not part of the above table can be added based on extra cost.<br>- During development all in-progress updates will be shared via WhatsApp group and customer can validate.<br>- The Service renewal cost should be paid immediately after end of free paid support (1 Year), any further delay will result in service termination.<br>- Vendor will not provide source code, database, or hosting credentials without specific conditions and cost.<br>- For 3rd party integration, subject to official document verification submitted to the provider.`,
    },
    { id: uid(), type: "table", title: "Payment Terms", data: paymentTerms },
    {
      id: uid(),
      type: "text",
      title: "Closing Note",
      content: `In case of failure with the above payment conditions, Augmentuss Automations LLP has all rights to revoke access of the project, data and all related information. Tentative date of final delivery of the project is 6 to 12 weeks from making the advance payment.<br><br>Hereby we (Augmentuss Automations LLP) confirm all details mentioned in this document are correct and committed to deliver as described. Request to sign off this document by authorized personnel to agree on the above details and T&amp;C.`,
    },
    {
      id: uid(),
      type: "text",
      title: "Signature Block",
      content: `__signature__|For Augmentuss Automations LLP|For SJR Trading Co.`,
    },
  ];
}
