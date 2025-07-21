'package net.fimastgd.forevercore.modules.numbers';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Numbers = void 0;
/**
 * [ DEPRECATED ] Utility class for number type checking [ DEPRECATED ]
 * [ NEW ] Use 'number-utils-all'! [ NEW ]
 *
 * import { Numbers } from 'number-utils-all'
 * const nums = new Numbers();
 * nums.Int(numq) ? "integer" : "not integer / not number"
 * etc.
 */
class Numbers {
    /**
     * Check if a value is a valid number
     * @param value - Value to check
     * @returns True if the value is a number
     */
    isNumber(value) {
        return !isNaN(Number(value));
    }
    /**
     * Alias for isNumber
     * @param value - Value to check
     * @returns True if the value is a number
     */
    Number(value) {
        return this.isNumber(value);
    }
    /**
     * Check if a value is an integer
     * @param value - Value to check
     * @returns True if the value is an integer
     */
    Int(value) {
        if (this.isNumber(value)) {
            // Check if the value has a decimal point
            return !value.toString().includes('.');
        }
        return false;
    }
    /**
     * Check if a value is a floating point number (has decimal)
     * @param value - Value to check
     * @returns True if the value is a floating point number
     */
    Double(value) {
        if (this.isNumber(value)) {
            return value.toString().includes('.');
        }
        return false;
    }
    /**
     * Check if a value is a positive number
     * @param value - Value to check
     * @returns True if the value is positive
     */
    Positive(value) {
        if (this.isNumber(value)) {
            return !value.toString().includes('-');
        }
        return false;
    }
    /**
     * Check if a value is a negative number
     * @param value - Value to check
     * @returns True if the value is negative
     */
    Negative(value) {
        if (this.isNumber(value)) {
            return value.toString().includes('-');
        }
        return false;
    }
    /**
     * Check if a value is a non-negative integer
     * @param value - Value to check
     * @returns True if the value is a non-negative integer
     */
    NonNegativeInt(value) {
        return this.Int(value) && this.Positive(value);
    }
    /**
     * Check if a value is within a range (inclusive)
     * @param value - Value to check
     * @param min - Minimum value
     * @param max - Maximum value
     * @returns True if the value is within the range
     */
    InRange(value, min, max) {
        if (!this.isNumber(value)) {
            return false;
        }
        const numValue = Number(value);
        return numValue >= min && numValue <= max;
    }
    /**
     * Ensure a value is within a range, returning the min or max if out of bounds
     * @param value - Value to check
     * @param min - Minimum value
     * @param max - Maximum value
     * @returns The value clamped to the range
     */
    Clamp(value, min, max) {
        if (!this.isNumber(value)) {
            return min;
        }
        const numValue = Number(value);
        return Math.min(Math.max(numValue, min), max);
    }
    /**
     * Parse a string to an integer safely
     * @param value - Value to parse
     * @param defaultValue - Default value if parsing fails
     * @returns Parsed integer or default value
     */
    ParseInt(value, defaultValue = 0) {
        if (!this.isNumber(value)) {
            return defaultValue;
        }
        return parseInt(value.toString(), 10);
    }
    /**
     * Parse a string to a float safely
     * @param value - Value to parse
     * @param defaultValue - Default value if parsing fails
     * @returns Parsed float or default value
     */
    ParseFloat(value, defaultValue = 0) {
        if (!this.isNumber(value)) {
            return defaultValue;
        }
        return parseFloat(value.toString());
    }
}
exports.Numbers = Numbers;
exports.default = Numbers;
