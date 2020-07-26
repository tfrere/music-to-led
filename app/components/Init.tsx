import React from 'react';
import CircularSlider from './generic/CircularSlider';
import InputRange from 'react-input-range';

class Init extends React.Component {
  state = { value: 0.6, valueSlider: { min: 2, max: 5 } };

  handleChange = (x, y) => {
    this.setState({ value: y });
  };

  render() {
    return (
      <div className="screen-size flex-center-wrapper">
        <div style={{ width: '300px', textAlign: 'center' }}>
          {/* <h2>Visualisation disabled</h2>
          <p style={{ opacity: '0.3' }}>
            You can use it if you have performances issues.
          </p> */}

          <InputRange
            draggableTrack
            maxValue={20}
            minValue={0}
            draggableTrack={false}
            onChange={value => this.setState({ valueSlider: value })}
            onChangeComplete={value => console.log(value)}
            value={this.state.valueSlider}
          />

          <CircularSlider
            radius={140}
            border={30}
            value={this.state.value}
            onChange={(x, y) => {
              console.log(y);
              this.setState({ value: y });
            }}
          />
        </div>
      </div>
    );
  }
}

export default Init;
