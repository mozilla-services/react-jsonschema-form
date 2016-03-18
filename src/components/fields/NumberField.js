import React, { PropTypes } from "react";

import { asNumber } from "../../utils";
import StringField from "./StringField";

function NumberField(props) {
  return (
    <StringField {...props}
      onChange={(value) => props.onChange(asNumber(value))} />
  );
}

if (process.env.NODE_ENV !== "production") {
  NumberField.propTypes = {
    schema: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    formData: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    required: PropTypes.bool,
  };
}

NumberField.defaultProps = {
  uiSchema: {}
};

export default NumberField;
