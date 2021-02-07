import React from 'react';
import Button from './Button';

class InputFile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileName: '',
      filePath: ''
    };
  }

  handleInputChange = e => {
    console.log(e.target.files);
    let path = this.state.filePath || null;
    let name = this.state.fileName || null;
    if(e.target.files.length) {
      path = e.target.files[0].path;
      name = e.target.files[0].name;
      this.setState(
        {
          filePath: path,
          fileName: name
        },
        () => {
          this.props.onChange(this.state.filePath);
        }
      );
    }
};

  render() {
    return (
      <div className="input-file">
        <div className="input-file__button-wrapper">
          <Button className="button--big button--large button--stretched">
            {this.state.fileName || "Select your file"}
          </Button>
          <input
            type="file"
            onChange={this.handleInputChange}
            ref={input => (this.fileInput = input)}
            className="form-control"
          />
        </div>
        {/* <h6>
          {this.state.filePath ? (
            <span>{this.state.filePath}</span>
          ) : (
            <span>No file selected</span>
          )}
        </h6> */}
        <br />
      </div>
    );
  }
}

export default InputFile;
