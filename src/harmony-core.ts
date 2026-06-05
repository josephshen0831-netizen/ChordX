// Original TypeScript core, kept for future expansion into a typed app.
export type NoteName = "C" | "C#" | "Db" | "D" | "D#" | "Eb" | "E" | "F" | "F#" | "Gb" | "G" | "G#" | "Ab" | "A" | "A#" | "Bb" | "B";
export type Pitch = number;

export enum Mode { Major = "Major", Minor = "Minor" }
export enum HarmonyFunction { T = "T", S = "S", D = "D" }

export enum NoteIdType {
  Diatonic = "Diatonic",
  HarmonicMinorSeventh = "Harmonic7th",
  TemporaryAccidental = "Temporary",
}

export interface Tonality {
  root: NoteName;
  mode: Mode;
  name: string;
}

export interface MelodyNote {
  noteName: NoteName;
  octave: number;
  pitch: Pitch;
  type?: NoteIdType;
}

export interface ChordTemplate {
  name: string;
  function: HarmonyFunction;
  rootDegree: number;
  inversion: 0 | 1 | 2;
}

export interface FourPartChord {
  soprano: Pitch;
  alto: Pitch;
  tenor: Pitch;
  bass: Pitch;
  function: HarmonyFunction;
  template: ChordTemplate;
}

export interface ValidationError {
  type: "Spacing" | "Parallel" | "Function";
  message: string;
  chordIndex: number;
}
