// Slug generation helper functions

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if slug already exists
 */
export function generateUniqueSlug(
    text: string,
    existingSlugs: string[],
): string {
    let slug = generateSlug(text);
    let counter = 1;

    while (existingSlugs.includes(slug)) {
        slug = `${generateSlug(text)}-${counter}`;
        counter++;
    }

    return slug;
}

/**
 * Generate a slug with random suffix for guaranteed uniqueness
 */
export function generateSlugWithSuffix(text: string): string {
    const baseSlug = generateSlug(text);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${suffix}`;
}
