import React from "react";

class MidiVisualizer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let notes = this.props.midi_datas.map((note, index) => {
      if (note.type != "note_off" && index < 5) {
        return (
          <div ref={note + index}>
            {note.port} : {note.type} : {note.note} at {note.velocity}
          </div>
        );
      }
    });

    if (notes.length == 0) {
      return (
        <div className="card">
          <span className="ghost">No data yet.</span>
        </div>
      );
    }

    return <div className="card">{notes}</div>;
  }
}

export default MidiVisualizer;
