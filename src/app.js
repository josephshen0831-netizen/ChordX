const circleOfFifths = {
  "0": { major: "C", minor: "A" },
  "1#": { major: "G", minor: "E" },
  "2#": { major: "D", minor: "B" },
  "3#": { major: "A", minor: "F#" },
  "4#": { major: "E", minor: "C#" },
  "5#": { major: "B", minor: "G#" },
  "1b": { major: "F", minor: "D" },
  "2b": { major: "Bb", minor: "G" },
  "3b": { major: "Eb", minor: "C" },
  "4b": { major: "Ab", minor: "F" },
  "5b": { major: "Db", minor: "Bb" },
};

const noteToValue = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const chordLibrary = [
  { name: "T", function: "T", rootDegree: 1, inversion: 0 },
  { name: "T6", function: "T", rootDegree: 1, inversion: 1 },
  { name: "S", function: "S", rootDegree: 4, inversion: 0 },
  { name: "S6", function: "S", rootDegree: 4, inversion: 1 },
  { name: "D", function: "D", rootDegree: 5, inversion: 0 },
  { name: "D6", function: "D", rootDegree: 5, inversion: 1 },
  { name: "K46", function: "D", rootDegree: 1, inversion: 2 },
];

const notePattern = /^([A-G](?:#|b)?)(-?\d+)$/;

function determineKey(signature, finalNote) {
  const relative = circleOfFifths[signature];
  if (!relative) {
    throw new Error(`未知调号: ${signature}`);
  }

  const isMinor = finalNote.toUpperCase() === relative.minor.toUpperCase();
  const mode = isMinor ? "Minor" : "Major";
  const root = isMinor ? relative.minor : relative.major;

  return { root, mode, name: `${isMinor ? root.toLowerCase() : root} ${mode}` };
}

function buildDiatonicPitchClasses(tonality) {
  const majorSteps = [0, 2, 4, 5, 7, 9, 11];
  const naturalMinorSteps = [0, 2, 3, 5, 7, 8, 10];
  const rootValue = noteToValue[tonality.root];
  const steps = tonality.mode === "Minor" ? naturalMinorSteps : majorSteps;

  return steps.map((step) => (rootValue + step) % 12);
}

function parseMelody(input) {
  return input
    .split(/[\s,;，；]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const match = token.match(notePattern);
      if (!match || !(match[1] in noteToValue)) {
        throw new Error(`无法识别音符: ${token}`);
      }

      const noteName = match[1];
      const octave = Number(match[2]);
      const pitch = 12 * (octave + 1) + noteToValue[noteName];
      return { noteName, octave, pitch };
    });
}

function processMelody(melody, tonality, diatonicPitchClasses) {
  const rootValue = noteToValue[tonality.root];
  const raised7th = tonality.mode === "Minor" ? (rootValue + 11) % 12 : -1;

  return melody.map((note) => {
    const pitchClass = noteToValue[note.noteName];
    let type = "Temporary";

    if (tonality.mode === "Minor" && pitchClass === raised7th) {
      type = "Harmonic7th";
    } else if (diatonicPitchClasses.includes(pitchClass)) {
      type = "Diatonic";
    }

    return { ...note, type };
  });
}

function getCandidates(note) {
  if (note.type === "Harmonic7th") {
    return chordLibrary.filter((chord) => chord.function === "D");
  }

  return chordLibrary;
}

function runPipeline(rawMelody, signature, finalNote) {
  const tonality = determineKey(signature, finalNote);
  const diatonicPitchClasses = buildDiatonicPitchClasses(tonality);
  const processedMelody = processMelody(rawMelody, tonality, diatonicPitchClasses);

  return {
    tonality,
    processedMelody,
    log: [
      "启动斯波索宾 AI 和声流水线",
      `Key Determined: ${tonality.name}`,
      "旋律预处理完成",
      "候选和弦已生成，可继续接入 VexFlow 或动态规划算法",
    ],
  };
}

function renderNoteCard(note, index) {
  const typeClass = {
    Diatonic: "diatonic",
    Harmonic7th: "harmonic",
    Temporary: "temporary",
  }[note.type];

  const typeLabel = {
    Diatonic: "调内音",
    Harmonic7th: "和声小调升七级",
    Temporary: "临时变音",
  }[note.type];

  const candidates = getCandidates(note)
    .map((chord) => `<span>${chord.name}</span>`)
    .join("");

  return `
    <article class="note-card">
      <h2>${note.noteName}${note.octave}</h2>
      <span class="tag ${typeClass}">${typeLabel}</span>
      <p>MIDI: ${note.pitch} / 第 ${index + 1} 音</p>
      <div class="candidate-list" aria-label="候选和弦">${candidates}</div>
    </article>
  `;
}

function render() {
  const form = document.querySelector("#analysis-form");
  const signature = form.elements.signature.value;
  const finalNote = form.elements["final-note"].value;
  const melodyInput = form.elements.melody.value;

  const keyName = document.querySelector("#key-name");
  const noteCount = document.querySelector("#note-count");
  const hint = document.querySelector("#hint");
  const noteGrid = document.querySelector("#note-grid");
  const pipelineLog = document.querySelector("#pipeline-log");

  try {
    const rawMelody = parseMelody(melodyInput);
    const result = runPipeline(rawMelody, signature, finalNote);

    keyName.textContent = result.tonality.name;
    noteCount.textContent = String(result.processedMelody.length);
    hint.textContent = "已完成分析";
    noteGrid.innerHTML = result.processedMelody.map(renderNoteCard).join("");
    pipelineLog.innerHTML = result.log.map((item) => `<div>${item}</div>`).join("");
  } catch (error) {
    keyName.textContent = "无法分析";
    noteCount.textContent = "0";
    hint.textContent = error.message;
    noteGrid.innerHTML = "";
    pipelineLog.textContent = "请使用类似 C4 D4 E4 的格式输入旋律。";
  }
}

document.querySelector("#analysis-form").addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

document.querySelector("#minor-demo").addEventListener("click", () => {
  document.querySelector("#signature").value = "0";
  document.querySelector("#final-note").value = "A";
  document.querySelector("#melody").value = "A3 B3 C4 D4 E4 F4 G#4 A4";
  render();
});

render();
