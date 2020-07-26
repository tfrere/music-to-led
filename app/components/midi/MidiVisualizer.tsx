import React from 'react';

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
              {note.port} -> {note.type} : {note.note} at velocity{' '}
              {note.velocity}
            </div>
          );
        }
      });

      if (notes.length == 0) {
        toRender = (
          <div className="midi-logs">
            {/* <h3>{this.props.channels}</h3> */}
            No midi logs...
          </div>
        );
      } else {
        toRender = (
          <div className="midi-logs">
            {/* <h3>{this.props.channels}</h3> */}
            {notes || <div> </div>}
          </div>
        );
      }
    }
    return toRender;
  }
}

export default MidiVisualizer;
