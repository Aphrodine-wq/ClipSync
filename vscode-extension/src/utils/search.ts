/**
 * Search Utilities
 * Provides fuzzy search and filtering for clips
 */

import { ClipItem } from '../clipboardManager';

export interface SearchOptions {
    query?: string;
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
}

/**
 * Fuzzy search for clips
 */
export function fuzzySearch(clips: ClipItem[], query: string): ClipItem[] {
    if (!query || query.trim().length === 0) {
        return clips;
    }

    const lowerQuery = query.toLowerCase().trim();
    const queryWords = lowerQuery.split(/\s+/);

    return clips
        .map(clip => {
            const content = clip.content.toLowerCase();
            const type = clip.type.toLowerCase();
            
            // Calculate relevance score
            let score = 0;
            
            // Exact match in content
            if (content.includes(lowerQuery)) {
                score += 100;
            }
            
            // Word matches
            queryWords.forEach(word => {
                if (content.includes(word)) {
                    score += 10;
                }
                if (type.includes(word)) {
                    score += 5;
                }
            });
            
            // Position bonus (earlier matches score higher)
            const firstMatch = content.indexOf(lowerQuery);
            if (firstMatch !== -1) {
                score += Math.max(0, 50 - firstMatch / 10);
            }
            
            return { clip, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.clip);
}

/**
 * Filter clips by type
 */
export function filterByType(clips: ClipItem[], type: string): ClipItem[] {
    if (!type || type === 'all') {
        return clips;
    }
    return clips.filter(clip => clip.type === type);
}

/**
 * Filter clips by date range
 */
export function filterByDateRange(
    clips: ClipItem[],
    dateFrom?: Date,
    dateTo?: Date
): ClipItem[] {
    if (!dateFrom && !dateTo) {
        return clips;
    }

    return clips.filter(clip => {
        const clipDate = new Date(clip.timestamp);
        
        if (dateFrom && clipDate < dateFrom) {
            return false;
        }
        
        if (dateTo && clipDate > dateTo) {
            return false;
        }
        
        return true;
    });
}

/**
 * Combined search and filter
 */
export function searchClips(
    clips: ClipItem[],
    options: SearchOptions
): ClipItem[] {
    let results = [...clips];

    // Apply type filter
    if (options.type) {
        results = filterByType(results, options.type);
    }

    // Apply date range filter
    if (options.dateFrom || options.dateTo) {
        results = filterByDateRange(results, options.dateFrom, options.dateTo);
    }

    // Apply fuzzy search
    if (options.query) {
        results = fuzzySearch(results, options.query);
    }

    return results;
}

/**
 * Get available types from clips
 */
export function getAvailableTypes(clips: ClipItem[]): string[] {
    const types = new Set(clips.map(clip => clip.type));
    return Array.from(types).sort();
}

