import React from 'react';

import guessNoteFromNumber from '../../utils/guessNoteFromNumber.js';

const sysexMessage = note => {
  return (
    <>
      <span>{note.port}</span> -> <span>{note.action}</span> :
      <span> {note.data}</span>
    </>
  );
};

const standardMessage = note => {
  return (
    <>
      <span>{note.port}</span> -> <span>{note.type}</span> :
      <span> {guessNoteFromNumber(note.note)}</span> ({note.note}) at velocity{' '}
      <span>{note.velocity}</span>
    </>
  );
};

class MidiVisualizer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let notes = [];
    let toRender = null;
    if (this.props.midi_datas && this.props.channels) {
      notes = this.props.midi_datas.map((note, index) => {
        if (index == this.props.midi_datas.length - 1) {
          return (
            <div key={note + index} ref={note + index}>
              {note.type === 'sysex'
                ? sysexMessage(note)
                : standardMessage(note)}
            </div>
          );
        }
      });

      if (notes.length == 0) {
        toRender = <div className="midi-logs">No midi logs...</div>;
      } else {
        toRender = <div className="midi-logs">{notes || <div> </div>}</div>;
      }
    }
    return toRender;
  }
}

export default MidiVisualizer;
