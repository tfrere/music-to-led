import React from 'react';

class Select extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.defaultValue
    };
  }

  componentDidUpdate(oldProps) {
    if (this.props.defaultValue != oldProps.defaultValue) {
      this.setState({
        value: this.props.defaultValue
      });
    }
  }

  handleChange = e => {
    this.setState({
      value: e.target.value
    });
    this.props.setValue(e.target.value);
  };
  render(props) {
    let options = [];
    if (this.props.options) {
      options = this.props.options.map((elem, index) => {
        return (
          <option value={elem.name} key={elem.name + index}>
            {elem.prefix || null} {elem.name} {elem.suffix || null}
          </option>
        );
      });
    }

    return (
      <div
        disabled={this.props.disabled}
        className={'select ' + this.props.className}
        style={this.props.style}
      >
        <select disabled={this.props.disabled} value={this.state.value} onChange={this.handleChange}>
          {options}
        </select>
      </div>
    );
  }
}

export default Select;
