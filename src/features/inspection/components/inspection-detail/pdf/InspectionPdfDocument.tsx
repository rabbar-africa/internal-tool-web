import { Document, Page } from "@react-pdf/renderer";
import type { IOrganization } from "@/shared/interface/common";
import type { IInspection } from "@/shared/interface/inspection";
import { registerInspectionPdfFonts } from "./registerFonts";
import { sharedStyles } from "./styles";
import { groupFindings } from "./utils/findings";
import { parseNotes } from "./utils/notes";
import { ReportHeader } from "./components/ReportHeader";
import { VehicleInfo } from "./components/VehicleInfo";
import { InspectionSummary } from "./components/InspectionSummary";
import { SystemChecks } from "./components/SystemChecks";
import { TechnicianNotes } from "./components/TechnicianNotes";
import { ReportFooter } from "./components/ReportFooter";

registerInspectionPdfFonts();

interface InspectionPdfDocumentProps {
  inspection: IInspection;
  organization?: IOrganization;
}

/**
 * The inspection report, a port of the backend's HTML template
 * (internal-tool-backend/src/rendering/templates/inspections) so the two
 * outputs stay indistinguishable. Section components mirror that template's
 * own component split.
 */
export function InspectionPdfDocument({
  inspection,
  organization,
}: InspectionPdfDocumentProps) {
  // Both the summary tiles and the checks list read off one set of counts.
  const groups = groupFindings(inspection.findings);
  const noteBlocks = parseNotes(inspection.generalNotes);

  return (
    <Document title={`Inspection Report ${inspection.jobCode ?? ""}`.trim()}>
      <Page size="A4" style={sharedStyles.page}>
        <ReportHeader inspection={inspection} organization={organization} />
        <VehicleInfo inspection={inspection} />
        <InspectionSummary groups={groups} />
        <SystemChecks groups={groups} />
        <TechnicianNotes blocks={noteBlocks} />
        <ReportFooter inspection={inspection} organization={organization} />
      </Page>
    </Document>
  );
}
