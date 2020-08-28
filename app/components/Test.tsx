import React from 'react';
import CircularSlider from './generic/CircularSlider';
import InputRange from 'react-input-range';

import { render } from 'enzyme';

class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value0: 0.6,
      singleValue: 1,
      value1: 1,
      value2: 50,
      value3: 0,
      valueSlider: { min: 2, max: 5 }
    };
  }

  handleChange = (x, y) => {
    this.setState({ value: y });
  };

  render() {
    return (
      <div className="screen-size flex-center-wrapper">
        <div style={{ width: '100%', height: '100%', textAlign: 'center' }}>
          <InputRange
            maxValue={24}
            minValue={0}
            onChange={value => this.setState({ singleValue: value })}
            value={this.state.singleValue}
          />
          <InputRange
            maxValue={24}
            minValue={0}
            draggableTrack={false}
            onChange={value => this.setState({ valueSlider: value })}
            onChangeComplete={value => console.log(value)}
            value={this.state.valueSlider}
          />
          <span>
            {this.state.valueSlider.min} {this.state.valueSlider.max}
          </span>
          <CircularSlider
            value={this.state.value0}
            range={[0.1, 8.0]}
            step={0.1}
            round={1}
            onChange={y => {
              console.log('heehehe', y);
              this.setState({ value0: y });
            }}
          />
          <span>{this.state.value0}</span>
          <CircularSlider
            radius={140}
            border={30}
            value={this.state.value1}
            range={[1, 127]}
            step={1}
            round={0}
            onChange={y => {
              console.log('heehehe', y);
              this.setState({ value1: y });
            }}
          />
          <span>{this.state.value1}</span>
          <CircularSlider
            radius={140}
            border={30}
            value={this.state.value2}
            range={[1, 255]}
            step={1}
            round={0}
            onChange={y => {
              console.log('heehehe', y);
              this.setState({ value2: y });
            }}
          />
          <span>{this.state.value2}</span>
          <CircularSlider
            radius={140}
            border={30}
            value={this.state.value3}
            range={[-1, 1]}
            step={1}
            round={1}
            onChange={y => {
              console.log('heehehe', y);
              this.setState({ value3: y });
            }}
          />
          <span>{this.state.value3}</span>
        </div>
      </div>
    );
  }
}

export default Test;
