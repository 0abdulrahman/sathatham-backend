"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = slugify;
/**
 * Converts a given string into a slug, suitable for use in URLs.
 *
 * This function preserves Arabic characters, replaces spaces with dashes,
 * and removes any non-alphanumeric characters, except for Arabic characters
 * and hyphens. It also ensures that multiple consecutive dashes are replaced
 * by a single dash and trims leading or trailing dashes.
 *
 * @param {string} text - The input string to be slugified.
 * @returns {string} - The slugified string, with spaces replaced by dashes
 *                     and non-alphanumeric characters removed, except Arabic.
 *
 * @example
 * slugify('Hyper X العربية');
 * // returns 'hyper-x-العربية'
 *
 * @example
 * slugify('Example String!');
 * // returns 'example-string'
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '') // Remove non-alphanumeric characters (except Arabic)
        .replace(/-+/g, '-') // Replace multiple dashes with a single dash
        .replace(/^-|-$/g, ''); // Trim dashes from the start and end
}
