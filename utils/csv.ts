export type CsvValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | Array<string | number | boolean | Date | null | undefined>;

export interface CsvColumn<Row> {
  header: string;
  value: keyof Row | ((row: Row) => CsvValue);
}

export interface CsvSection<Row> {
  name?: string;
  columns: CsvColumn<Row>[];
  rows: Row[];
}

function normalizeCsvValue(value: Exclude<CsvValue, Array<unknown>>): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

function sanitizeCsvCell(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }

  return value;
}

function escapeCsvCell(value: CsvValue): string {
  const normalizedValue = Array.isArray(value)
    ? value.map((item) => normalizeCsvValue(item)).filter(Boolean).join(' | ')
    : normalizeCsvValue(value);

  const sanitizedValue = sanitizeCsvCell(normalizedValue);
  const escapedValue = sanitizedValue.replace(/"/g, '""');

  if (/[",\r\n]/.test(escapedValue)) {
    return `"${escapedValue}"`;
  }

  return escapedValue;
}

function resolveCsvValue<Row>(row: Row, column: CsvColumn<Row>): CsvValue {
  if (typeof column.value === 'function') {
    return column.value(row);
  }

  return row[column.value] as CsvValue;
}

export function buildCsv<Row>(sections: CsvSection<Row>[]): string {
  const lines: string[] = [];

  sections.forEach((section, sectionIndex) => {
    if (section.name) {
      lines.push(escapeCsvCell(section.name));
    }

    lines.push(section.columns.map((column) => escapeCsvCell(column.header)).join(','));

    section.rows.forEach((row) => {
      lines.push(
        section.columns
          .map((column) => escapeCsvCell(resolveCsvValue(row, column)))
          .join(',')
      );
    });

    if (sectionIndex < sections.length - 1) {
      lines.push('');
    }
  });

  return lines.join('\r\n');
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  const utf8Bom = '\uFEFF';
  const contentWithBom = csvContent.startsWith(utf8Bom)
    ? csvContent
    : `${utf8Bom}${csvContent}`;

  const blob = new Blob([contentWithBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function sanitizeFilename(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'export';
}
