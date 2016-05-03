import React, { PropTypes } from "react";


function rangeSpec(schema) {
  const spec = {};
  if (schema.multipleOf) {
    spec.step = schema.multipleOf;
  }
  if (schema.minimum) {
    spec.min = schema.minimum;
  }
  if (schema.maximum) {
    spec.max = schema.maximum;
  }
  return spec;
}

function RangeWidget({
  schema,
  id,
  placeholder,
  value,
  required,
  disabled,
  readonly,
  onChange
}) {
  return (
    <div className="field-range-wrapper">
      <input type="range"
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        onChange={(event) => onChange(event.target.value)}
        {...rangeSpec(schema)} />
      <span className="range-view">{value}</span>
    </div>
  );
}

if (process.env.NODE_ENV !== "production") {
  RangeWidget.propTypes = {
    schema: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    required: PropTypes.bool,
    onChange: PropTypes.func,
  };
}

export default RangeWidget;
