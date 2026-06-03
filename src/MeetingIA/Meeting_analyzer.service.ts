import { Injectable } from '@nestjs/common';

@Injectable()
export class MeetingAnalyzerService {
  private readonly DECISION_KEYWORDS = [
    'décision', 'decision', 'accord',
    'valide', 'choisissons',
    'approuvé', 'décidé', 'convenu',
    'nous décidons', 'on décide', "c'est décidé",
  ];

  private readonly ACTION_KEYWORDS = [
    'action', 'faire', 'vais',
    'ferai', 'réaliser',
    'préparer', 'contacter',
    'envoyer', 'créer',
    'je vais', 'nous allons', 'il faut', 'je dois',
  ];

  private readonly DATE_PATTERNS = [
    /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/g,
    /\d{4}-\d{2}-\d{2}/g,
    /\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/gi,
    /(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{1,2},?\s+\d{4}/gi,
  ];

  private readonly STOP_WORDS = new Set([
    'le', 'la', 'les', 'un', 'une', 'et', 'ou', 'donc', 'pour', 'dans',
    'avec', 'sans', 'par', 'sur', 'sous', 'est', 'sont', 'ce', 'cet',
    'cette', 'ces', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils',
    'elles', 'on', 'a', 'au', 'aux', 'du', 'des', 'de', 'que', 'qui',
    'dont', 'où', 'en', 'y', 'me', 'te', 'se', 'lui', 'leur',
  ]);

  // ── Decisions ────────────────────────────────────────────────
  extractDecisions(transcripts: string[]): string[] {
    const found = transcripts.filter((text) =>
      this.DECISION_KEYWORDS.some((kw) => text.toLowerCase().includes(kw)),
    );
    // deduplicate
    return [...new Set(found)].slice(0, 10);
  }

  // ── Actions ──────────────────────────────────────────────────
  extractActions(transcripts: string[]): string[] {
    const found = transcripts.filter((text) =>
      this.ACTION_KEYWORDS.some((kw) => text.toLowerCase().includes(kw)),
    );
    return [...new Set(found)].slice(0, 10);
  }

  // ── Dates ────────────────────────────────────────────────────
  extractDates(fullText: string): string[] {
    const dates: string[] = [];

    for (const pattern of this.DATE_PATTERNS) {
      const matches = fullText.match(pattern) ?? [];
      for (const match of matches) {
        const clean = Array.isArray(match)
          ? (match as string[]).join(' ').trim()
          : (match as string).trim();
        if (clean.length > 3 && !dates.includes(clean)) {
          dates.push(clean);
        }
      }
    }

    return dates.slice(0, 10);
  }

  // ── Keywords ─────────────────────────────────────────────────
  extractKeywords(transcripts: string[]): string[] {
    const freq = new Map<string, number>();

    for (const text of transcripts) {
      const words = text.match(/\b[A-Za-zÀ-ÿ]{4,}\b/g) ?? [];
      for (const word of words) {
        const lower = word.toLowerCase();
        if (!this.STOP_WORDS.has(lower)) {
          freq.set(lower, (freq.get(lower) ?? 0) + 1);
        }
      }
    }

    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);
  }

  // ── Summary ──────────────────────────────────────────────────
  generateSummary(
    transcripts: string[],
    durationMinutes: number,
    decisions: string[],
    actions: string[],
    dates: string[],
    keywords: string[],
  ): string {
    if (!transcripts.length) return 'Aucune transcription disponible';

    const fullText = transcripts.join(' ');
    const sentences = fullText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');

    const parts: string[] = [
      `📅 Réunion du ${dateStr}`,
      `⏱️ Durée: ${durationMinutes} minutes`,
      `💬 Échanges: ${transcripts.length} phrases`,
    ];

    if (sentences.length) {
      parts.push('\n📝 Points clés:');
      sentences.slice(0, 3).forEach((s, i) => {
        parts.push(`  ${i + 1}. ${s.length > 150 ? s.slice(0, 147) + '...' : s}`);
      });
    }

    if (decisions.length) {
      parts.push(`\n✅ Décisions (${decisions.length}):`);
      decisions.slice(0, 5).forEach((d) => {
        parts.push(`  • ${d.length > 100 ? d.slice(0, 97) + '...' : d}`);
      });
    }

    if (actions.length) {
      parts.push(`\n📋 Actions (${actions.length}):`);
      actions.slice(0, 5).forEach((a) => {
        parts.push(`  • ${a.length > 100 ? a.slice(0, 97) + '...' : a}`);
      });
    }

    if (dates.length) {
      parts.push(`\n📅 Dates importantes: ${dates.slice(0, 5).join(', ')}`);
    }

    if (keywords.length) {
      parts.push(`🏷️ Mots-clés: ${keywords.join(', ')}`);
    }

    return parts.join('\n');
  }

  // ── Full analysis in one call ─────────────────────────────────
  analyze(transcripts: string[], durationMinutes: 0 | number) {
    const fullText = transcripts.join(' ');

    const decisions = this.extractDecisions(transcripts);
    const actions = this.extractActions(transcripts);
    const dates = this.extractDates(fullText);
    const keywords = this.extractKeywords(transcripts);
    const summary = this.generateSummary(
      transcripts,
      durationMinutes,
      decisions,
      actions,
      dates,
      keywords,
    );

    return { decisions, actions, important_dates: dates, keywords, summary };
  }
}