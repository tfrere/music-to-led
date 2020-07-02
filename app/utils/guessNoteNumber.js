// guessNoteNumber is comming from https://github.com/djipco/webmidi/blob/master/src/webmidi.js

/**
 * Returns a MIDI note number matching the note name passed in the form of a string parameter. The
 * note name must include the octave number. The name can also optionally include a sharp (#),
 * a double sharp (##), a flat (b) or a double flat (bb) symbol: C5, G4, D#-1, F0, Gb7, Eb-1,
 * Abb4, B##6, etc.
 *
 * Note that, in converting note names to numbers, C4 is considered to be middle C (MIDI note
 * number 60) as per the scientific pitch notation standard.
 *
 * Also note that the resulting note number is offset by the `octaveOffset` value (if not zero).
 * For example, if you pass in "C4" and the `octaveOffset` value is 2 the resulting MIDI note
 * number will be 36.
 *
 * @method noteNameToNumber
 * @static
 *
 * @param name {String} The name of the note in the form of a letter, followed by an optional "#",
 * "##", "b" or "bb" followed by the octave number.
 *
 * @throws {RangeError} Invalid note name.
 * @throws {RangeError} Invalid note name or note outside valid range.
 * @return {Number} The MIDI note number (between 0 and 127)
 */
let noteNameToNumber = function (name) {
  if (typeof name !== "string") name = "";

  var matches = name.match(/([CDEFGAB])(#{0,2}|b{0,2})(-?\d+)/i);
  if (!matches) throw new RangeError("Invalid note name.");

  var _semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var _octaveOffset = 0;

  var semitones = _semitones[matches[1].toUpperCase()];
  var octave = parseInt(matches[3]);
  var result = (octave + 1 - Math.floor(_octaveOffset)) * 12 + semitones;

  if (matches[2].toLowerCase().indexOf("b") > -1) {
    result -= matches[2].length;
  } else if (matches[2].toLowerCase().indexOf("#") > -1) {
    result += matches[2].length;
  }

  if (result < 0 || result > 127) {
    throw new RangeError("Invalid note name or note outside valid range.");
  }

  return result;
};

/**
 * Returns a valid MIDI note number (0-127) given the specified input. The input usually is a note
 * name (C3, F#4, D-2, G8, etc.). If an integer between 0 and 127, it will simply be returned as
 * is.
 *
 * @method guessNoteNumber
 * @static
 *
 * @param input {Number|String} A string to extract the note number from. An integer can also be
 * used, in which case it will simply be returned (if between 0 and 127).
 * @throws {Error} Invalid input value
 * @returns {Number} A valid MIDI note number (0-127).
 */
let guessNoteNumber = (input) => {
  var output = false;

  if (input && input.toFixed && input >= 0 && input <= 127) {
    // uint
    output = Math.round(input);
  } else if (parseInt(input) >= 0 && parseInt(input) <= 127) {
    // uint as string
    output = parseInt(input);
  } else if (typeof input === "string" || input instanceof String) {
    // string
    output = noteNameToNumber(input);
  }

  if (output === false) throw new Error("Invalid input value (" + input + ").");
  return output;
};

export default guessNoteNumber;

// Tests
// console.log(guessNoteNumber(1));
// console.log(guessNoteNumber("C3"));
