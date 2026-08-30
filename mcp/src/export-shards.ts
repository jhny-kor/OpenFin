type ExportItem = { id: string; [key: string]: unknown };

export function recombineOntologyExportPayloads(payloads: readonly unknown[]): { items: ExportItem[]; reference_items: ExportItem[] } {
  const combined = { items: [] as ExportItem[], reference_items: [] as ExportItem[] };
  for (const [payloadIndex, payload] of payloads.entries()) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new TypeError(`ontology export payload ${payloadIndex} must be an object`);
    const value = payload as { reference_items?: unknown; items?: unknown };
    if (!Array.isArray(value.items)) throw new TypeError(`ontology export payload ${payloadIndex}.items must be an array`);
    if (value.reference_items !== undefined && !Array.isArray(value.reference_items)) throw new TypeError(`ontology export payload ${payloadIndex}.reference_items must be an array`);
    for (const [field, entries] of [["items", value.items], ["reference_items", value.reference_items ?? []]] as const) {
      for (const [itemIndex, item] of entries.entries()) {
        if (!item || typeof item !== "object" || Array.isArray(item) || typeof (item as ExportItem).id !== "string" || !(item as ExportItem).id) {
          throw new TypeError(`ontology export payload ${payloadIndex}.${field}[${itemIndex}].id must be a non-empty string`);
        }
        combined[field].push(item as ExportItem);
      }
    }
  }
  return combined;
}

export function mergeOntologyExportItems(payloads: readonly unknown[]): Record<string, unknown>[] {
  const combined = recombineOntologyExportPayloads(payloads);
  const itemsById = new Map<string, ExportItem>();
  for (const item of [...combined.reference_items, ...combined.items]) {
    if (!itemsById.has(item.id)) itemsById.set(item.id, item);
  }
  return [...itemsById.values()];
}
