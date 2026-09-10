export class ReadingTime {
    static countVisibleWords(extractedText: string): number {
        return extractedText.trim() ? extractedText.trim().split(/\s+/u).filter(Boolean).length : 0;
    }

    static estimateMinutes(extractedText: string): number {
        return Math.max(1, Math.ceil(this.countVisibleWords(extractedText) / 200));
    }
}
