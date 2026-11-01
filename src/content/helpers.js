// Helpers that keep mission content short and uniform.

export const ok = (id, label, pic) => ({ id, label, pic, correct: true });
export const no = (id, label, feedback, pic) => ({ id, label, pic, feedback });
export const opt = (id, label, pic) => ({ id, label, pic });

// Trial predicates for evidence requirements. Each receives a trial
// { settings, result } that progress.js has just re-run through the model.
export const lit = (id) => (t) => t.result.lit?.[id] === true;
export const dark = (id) => (t) => t.result.status !== 'unavailable' && t.result.lit?.[id] === false;
export const allOff = (t) => t.result.status !== 'unavailable' && Object.values(t.result.lit || {}).every((v) => !v);
export const sw = (id, closed) => (t) => t.settings.switches[id] === closed;
export const conn = (id, m) => (t) => t.settings.connectors[id] === m;
export const bulbIn = (id, present) => (t) => t.settings.bulbs[id] === present;
export const val = (k, v) => (t) => t.settings.values[k] === v;
export const res = (k, v) => (t) => t.result[k] === v;
export const item = (id) => (t) => t.result.item === id;
export const prop = (k, v) => (t) => t.result.props?.[k] === v;
export const and = (...fns) => (t) => fns.every((f) => f(t));
export const noGaps = (t) => !Object.values(t.settings.connectors).includes('missing');

// Two trials that differ in exactly one value: a fair comparison.
export function onlyChanged(key) {
  return (a, b) => {
    const va = a.settings.values;
    const vb = b.settings.values;
    if (key in va) return va[key] !== vb[key] && Object.keys(va).every((k) => k === key || va[k] === vb[k]);
    const ca = a.settings.connectors;
    const cb = b.settings.connectors;
    return ca[key] !== cb[key]
      && Object.keys(ca).every((k) => k === key || ca[k] === cb[k])
      && JSON.stringify(a.settings.switches) === JSON.stringify(b.settings.switches);
  };
}

export const CURRICULUM_PENDING = Object.freeze({
  source: 'Proposed teaching selection. Check against the current adopted NIE science syllabus.',
  outcomeCode: null,
  status: 'Proposed',
  reviewer: null,
  reviewDate: null,
});

const pad = (n) => String(n).padStart(2, '0');

/**
 * Turn compact authoring into a full mission record.
 * evidence: [[id, label, test]] or [id, label, { pair }] / [id, label, { all }]
 */
export function mission(m) {
  const [briefHeading, briefText, briefAlt] = m.brief;
  const [question, choices, reasons] = m.predict;
  const [labHeading, instruction, layout, alt] = m.lab;
  return {
    missionId: m.id || `power-g${m.grade}-${pad(m.number)}`,
    house: m.house || 1,
    contentVersion: m.version || 1,
    grade: m.grade,
    number: m.number,
    title: m.title,
    concept: m.concept,
    learningGoal: m.goal,
    curriculum: CURRICULUM_PENDING,
    prerequisites: m.prerequisites || (m.number > 1 && !m.id ? [`power-g${m.grade}-${pad(m.number - 1)}`] : []),
    testWord: m.testWord || (layout.kind === 'catalogue' || layout.kind === 'rooms' ? 'Check' : layout.kind === 'hidden' ? 'Look' : 'Test'),
    pictures: m.grade <= 2,
    brief: { heading: briefHeading, text: briefText, alt: briefAlt },
    prediction: {
      question,
      choices,
      reasonQuestion: reasons ? 'Why do you think so? (optional)' : undefined,
      reasons,
    },
    play: { heading: labHeading, instruction, layout, alt, misconception: m.misconception },
    evidence: {
      heading: m.evidenceHeading || 'What did you find?',
      requirements: m.evidence.map(([id, label, test]) =>
        typeof test === 'function' ? { id, label, test } : { id, label, ...test }),
    },
    explain: {
      heading: m.explain.heading || 'Explain what you found',
      question: m.explain.q,
      choices: m.explain.choices,
      hints: m.explain.hints,
      evidenceQuestion: m.explain.evidenceQ,
      evidenceTest: m.explain.evidenceTest,
      allowAloud: m.explain.aloud === true,
    },
    transfer: m.transfer.map((t, i) => ({
      variant: 'AB'[i],
      heading: t.heading,
      text: t.text,
      alt: t.alt,
      layout: t.layout,
      question: t.q,
      choices: t.choices,
      hints: t.hints,
    })),
    summary: { idea: m.idea, lesson: m.lesson },
  };
}
