import React from 'react';
import { eleven } from '../../assets/css/const/_skeleton.scss';
import ColorScheme from './ColorScheme';

const createMarkup = html => {
  return { __html: html };
};

class Select extends React.Component {
  constructor(props) {
    super(props);
    console.log('init select');
  }
  handleChange = e => {
    this.props.setValue(e.target.value);
  };
  render(props) {
    let options = [];

    if (this.props.options) {
      options = this.props.options.map((elem, index) => {
        // console.log(elem.scheme);
        return (
          <option value={elem.name} key={elem.name + index}>
            {elem.name}
            {elem.scheme ? <ColorScheme scheme={elem.scheme} /> : null}
          </option>
        );
      });
    }

    return (
      <select value={this.props.value} onChange={this.handleChange}>
        {options}
      </select>
    );
  }
}

export default Select;
