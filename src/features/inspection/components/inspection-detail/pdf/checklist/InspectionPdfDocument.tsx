import { Document, Page, View } from "@react-pdf/renderer";
import type { IOrganization } from "@/shared/interface/common";
import type { IInspection } from "@/shared/interface/inspection";
import { registerInspectionPdfFonts } from "../shared/registerFonts";
import { sharedStyles } from "./styles";
import { buildBands } from "./utils/findings";
import { parseNotes } from "../shared/notes";
import { Masthead } from "./components/Masthead";
import { VerdictBar } from "./components/VerdictBar";
import { FindingBands } from "./components/FindingBands";
import { ScopeSection } from "./components/ScopeSection";
import { TechnicianNotes } from "./components/TechnicianNotes";
import { ReportFooter } from "./components/ReportFooter";

registerInspectionPdfFonts();

interface InspectionPdfDocumentProps {
  inspection: IInspection;
  organization?: IOrganization;
}

/**
 * The inspection report, a port of the reference sheet
 * (src/for-claude/inspection.html). It is organised by urgency rather than by
 * component: the advisory drives the bands, and the checklist backs them up
 * with what was inspected and found sound.
 */
export function InspectionPdfDocument({
  inspection,
  organization,
}: InspectionPdfDocumentProps) {
  const bands = buildBands(inspection.advisory, inspection.findings);
  const noteBlocks = parseNotes(inspection.generalNotes);

  return (
    <Document title={`Inspection Report ${inspection.jobCode ?? ""}`.trim()}>
      <Page size="A4" style={sharedStyles.page}>
        <Masthead inspection={inspection} organization={organization} />
        <VerdictBar advisory={inspection.advisory} bands={bands} />

        <View style={sharedStyles.body}>
          <FindingBands bands={bands} />
          <ScopeSection checklists={inspection.inspectionChecklists ?? []} />
          <TechnicianNotes blocks={noteBlocks} />
        </View>

        <ReportFooter inspection={inspection} organization={organization} />
      </Page>
    </Document>
  );
}
