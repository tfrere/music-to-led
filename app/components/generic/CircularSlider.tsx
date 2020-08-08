import React from 'react';

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

class CircularSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPinching: false
    };
  }

  componentDidMount() {
    this.y = 0;

    var myEfficientFn = debounce(this.handleMouseMove, 10, false);

    document.addEventListener('mousemove', myEfficientFn);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseUp = () => {
    this.setState({ isPinching: false });
  };

  updateLocalY = pageY => {
    const { left, top, width, height } = this.potar.getBoundingClientRect();
    const y = top + height / 2 - pageY;
    const dy = (y - this.y) / 100;
    this.y = y;
    return dy;
  };

  handleMouseDown = e => {
    e.preventDefault();
    this.updateLocalY(e.pageY);

    this.setState({ isPinching: true });
  };

  convertRange = (value, r1, r2) => {
    value = ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
    return value;
  };

  convertForExternalRange = value => {
    return this.convertRange(value, [0.01, 0.74], this.props.range, false);
  };

  convertForInternalRange = value => {
    return this.convertRange(value, this.props.range, [0.01, 0.74], false);
  };

  handleMouseMove = e => {
    if (this.state.isPinching) {
      const dy = this.updateLocalY(e.pageY);
      console.log(dy);

      if (this.props.onChange) {
        let yValue = this.convertForInternalRange(this.props.value) + dy;

        if (yValue < 0.01) {
          yValue = 0.01;
        }

        if (yValue > 0.74) {
          yValue = 0.74;
        }

        let that = this;
        that.props.onChange(
          that.convertForExternalRange(yValue).toFixed(that.props.round)
        );
      }
    }
  };

  render() {
    const { radius, border } = this.props;

    const p = 2 * Math.PI * (radius - border / 2);

    const strokeWidth = border;
    const innerStrokeWidth = border / 1.1;
    const strokeDashoffset =
      p * (1 - this.convertForInternalRange(this.props.value));
    const strokeDasharray = p;

    const totalStrokeDashoffset = p * (1 - 0.74);
    const totalStrokeDasharray = p;

    return (
      <div className="circular-slider">
        <div className="circular-slider__svg-wrapper">
          <svg
            className="circular-slider__svg"
            ref={potar => (this.potar = potar)}
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            onMouseDown={this.handleMouseDown}
            style={{ transform: 'rotate(135deg)' }}
          >
            <defs>
              <filter
                id="dropshadow"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feComponentTransfer in="SourceAlpha">
                  <feFuncR type="discrete" tableValues="0.3" />
                  <feFuncG type="discrete" tableValues="0.3" />
                  <feFuncB type="discrete" tableValues="0.3" />
                </feComponentTransfer>
                <feGaussianBlur stdDeviation="3" />
                <feOffset dx="3" dy="1" result="shadow" />
                <feComposite in="SourceGraphic" in2="shadow" operator="over" />
              </filter>
            </defs>
            <circle
              className="circular-slider__svg__circle"
              strokeLinecap="round"
              style={{
                strokeWidth,
                strokeDashoffset: totalStrokeDashoffset,
                strokeDasharray: totalStrokeDasharray,
                filter: 'url(#dropshadow)'
              }}
              r={radius - border / 2}
              cx={radius}
              cy={radius}
            />
            <circle
              className="circular-slider__svg__circle"
              strokeLinecap="round"
              style={{
                strokeWidth,
                strokeDashoffset: totalStrokeDashoffset,
                strokeDasharray: totalStrokeDasharray
              }}
              r={radius - border / 2}
              cx={radius}
              cy={radius}
            />
            <circle
              className="circular-slider__svg__bar"
              strokeLinecap="round"
              style={{
                strokeWidth: innerStrokeWidth,
                strokeDashoffset,
                strokeDasharray
              }}
              r={radius - border / 2}
              cx={radius}
              cy={radius}
            />
          </svg>
          <svg
            className="circular-slider__svg-triangle"
            ref={potar => (this.potar = potar)}
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          >
            <polygon
              points={`${radius / 2 + 60},0 ${radius / 2 + 80},0  ${radius / 2 +
                70},10`}
              strokeLinecap="round"
              style={{ fill: 'white', strokeWidth: 1 }}
            />
          </svg>
        </div>
        <div className="circular-slider__value-wrapper">
          <p className="circular-slider__value">{this.props.value}</p>
        </div>
      </div>
    );
  }
}

CircularSlider.defaultProps = {
  radius: 140,
  border: 25,
  value: 0.5,
  range: [0.01, 8.0],
  step: 0.1,
  round: 0
};

export default CircularSlider;
