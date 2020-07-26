import React from 'react';

class CircularSlider extends React.Component {
  state = { isPinching: false };

  componentDidMount() {
    this.x = 0;
    this.y = 0;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseUp = () => {
    this.setState({ isPinching: false });
  };

  handleMouseDown = e => {
    e.preventDefault();

    const { left, top, width, height } = this.potar.getBoundingClientRect();

    this.x = e.pageX - (left + width / 2);
    this.y = top + height / 2 - e.pageY;

    this.setState({ isPinching: true });
  };

  handleMouseMove = e => {
    if (this.state.isPinching) {
      const { left, top, width, height } = this.potar.getBoundingClientRect();

      const x = e.pageX - (left + width / 2);
      const y = top + height / 2 - e.pageY;

      const dx = (x - this.x) / 100;
      const dy = (y - this.y) / 100;

      this.x = x;
      this.y = y;

      if (this.props.onChange) {
        let xValue = this.props.value + dx;
        let yValue = this.props.value + dy;

        if (xValue < 0) {
          xValue = 0;
        }

        if (xValue > 1) {
          xValue = 1;
        }

        if (yValue < 0) {
          yValue = 0;
        }

        if (yValue > 1) {
          yValue = 1;
        }

        this.props.onChange(xValue, yValue);
      }
    }
  };

  render() {
    const { radius, border, value } = this.props;
    const p = 2 * Math.PI * (radius - border / 2);

    const strokeWidth = border;
    const innerStrokeWidth = border / 1.8;
    const strokeDashoffset = p * (1 - value);
    const strokeDasharray = p;

    const valueToRender = value.toFixed(2);

    return (
      <div className="circular-slider">
        <svg
          className="circular-slider__svg"
          ref={potar => (this.potar = potar)}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          onMouseDown={this.handleMouseDown}
          style={{ transform: 'rotate(90deg)' }}
        >
          <polygon
            points="100,0 150,0 125,25"
            stroke-linecap="round"
            style={{ fill: 'lime', stroke: 'purple', strokeWidth: 1 }}
          />

          <circle
            className="circular-slider__svg__circle"
            style={{ strokeWidth }}
            r={radius - border / 2}
            cx={radius}
            cy={radius + 40}
          />

          <circle
            className="circular-slider__svg__bar"
            stroke-linecap="round"
            style={{
              strokeWidth: innerStrokeWidth,
              strokeDashoffset,
              strokeDasharray
            }}
            r={radius - border / 2}
            cx={radius}
            cy={radius + 40}
          />
        </svg>
        <p className="circular-slider__value">{valueToRender}</p>
      </div>
    );
  }
}

CircularSlider.defaultProps = {
  radius: 50,
  border: 30,
  value: 0.5
};

// CircularSlider.propTypes = {
//   onChange: PropTypes.func,
//   radius: PropTypes.number,
//   border: PropTypes.number,
//   value: (props, propName) => {
//     const value = parseInt(props[propName]);

//     if (isNaN(value)) {
//       return new Error('The potar value must be a number.');
//     }

//     if (value < 0 || value > 1) {
//       return new Error('The potar value must be between 0 and 1.');
//     }
//   }
// };

export default CircularSlider;
