export function parseCategoryIds(categoryIds: any): number[] {
  if (!categoryIds) return [];

  // If it's already an array, map to integers
  if (Array.isArray(categoryIds)) {
    return categoryIds
      .map((id: any) => parseInt(id))
      .filter((id: number) => !isNaN(id));
  }

  // If it's a string, try to handle it
  if (typeof categoryIds === 'string') {
    const trimmed = categoryIds.trim();
    if (trimmed === '') return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((id: any) => parseInt(id))
          .filter((id: number) => !isNaN(id));
      }
      if (typeof parsed === 'number') {
        return [parsed];
      }
    } catch (e) {
      // Ignore JSON parse error, try parsing as comma separated list
    }

    // Fallback: comma separated string e.g. "1,2,3"
    return trimmed
      .split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  }

  // If it's a number
  if (typeof categoryIds === 'number') {
    return [categoryIds];
  }

  return [];
}
