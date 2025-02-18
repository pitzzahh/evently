import type { EmploymentInformationDTO } from "@/types/employment-information";
import { formatCurrency } from "@/utils/format";
import { format } from "date-fns";
import type { Content } from "pdfmake/interfaces";

export function convertToServiceRecordData(employment_information: EmploymentInformationDTO[]): Content[][] {
  if (!employment_information?.length) return [];

  return employment_information
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .map(record => [
      // From date
      { text: format(record.start, 'MM/dd/yyyy'), alignment: 'center' },
      // To date 
      { text: record.end ? format(record.end, 'MM/dd/yyyy') : 'PRESENT', alignment: 'center' },
      // Position Title
      { text: record.position_info.description, alignment: 'center' },
      // Status
      { text: record.employment_status, alignment: 'center' },
      // Salary/Step
      {
        text: formatCurrency(
          record?.position_info?.salary_info
            ?.amount ?? -1,
        ), alignment: 'center'
      },
      // Office/Division/Station
      { text: record.school_info.name, alignment: 'center' },
      // Source of Fund 
      { text: record.source_of_fund, alignment: 'center' }, // Assuming default fund source
      // Remarks
      { text: record.remarks, alignment: 'left' }
    ]);
}