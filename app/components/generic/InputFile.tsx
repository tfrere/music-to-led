import React from 'react';
import Button from './Button';

class InputFile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileName: ''
    };
  }

  handleInputChange = e => {
    console.log(e);
    this.setState(
      {
        fileName: e.target.files[0].path
      },
      () => {
        this.props.onChange(this.state.fileName);
      }
    );
  };

  render() {
    return (
      <div className="input-file">
        <div className="input-file__button-wrapper">
          <Button className="button--big button--large button--stretched">
            Select your file
          </Button>
          <input
            type="file"
            onChange={this.handleInputChange}
            ref={input => (this.fileInput = input)}
            className="form-control"
          />
        </div>
        <h6>
          {this.state.fileName ? (
            <span>{this.state.fileName}</span>
          ) : (
            <span>No file selected</span>
          )}
        </h6>
        <br />
      </div>
    );
  }
}

export default InputFile;
