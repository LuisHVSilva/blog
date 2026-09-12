/** Estimates reading time from Markdown text already reduced to visible content. */
export class ReadingTime {
    /** Counts whitespace-delimited visible words without treating empty input as a word. */
    static countVisibleWords(extractedText: string): number {
        return extractedText.trim() ? extractedText.trim().split(/\s+/u).filter(Boolean).length : 0;
    }

    /** Returns a minimum one-minute estimate at the product's 200-words-per-minute rate. */
    static estimateMinutes(extractedText: string): number {
        return Math.max(1, Math.ceil(this.countVisibleWords(extractedText) / 200));
    }
}
