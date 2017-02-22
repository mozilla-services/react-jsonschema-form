import React, {PropTypes} from "react";

import ClearableWidget from "./ClearableWidget";
import {asNumber} from "../../utils";


/**
 * This is a silly limitation in the DOM where option change event values are
 * always retrieved as strings.
 */
function processValue({type, items}, value) {
  if (value === "") {
    return undefined;
  } else if (type === "array" && items && ["number", "integer"].includes(items.type)) {
    return value.map(asNumber);
  } else if (type === "boolean") {
    return value === "true";
  } else if (type === "number") {
    return asNumber(value);
  }
  return value;
}

function getValue(event, multiple) {
  if (multiple) {
    return [].slice.call(event.target.options)
      .filter(o => o.selected)
      .map(o => o.value);
  } else {
    return event.target.value;
  }
}

function SelectWidget({
  schema,
  id,
  options,
  value,
  clearable,
  required,
  disabled,
  readonly,
  multiple,
  autofocus,
  onChange,
  onBlur,
  placeholder
}) {
  const {enumOptions} = options;
  const emptyValue = multiple ? [] : "";
  const _onChange = (event) => {
    const newValue = getValue(event, multiple);
    onChange(processValue(schema, newValue));
  };
  const select = (
    <select
      id={id}
      multiple={multiple}
      className="form-control"
      value={typeof value === "undefined" ? emptyValue : value}
      required={required}
      disabled={disabled}
      readOnly={readonly}
      autoFocus={autofocus}
      onBlur={onBlur && (event => {
        const newValue = getValue(event, multiple);
        onBlur(id, processValue(schema, newValue));
      })}
      onChange={_onChange}>
      {!multiple && !schema.default && <option value="">{placeholder}</option>}
      {enumOptions.map(({value, label}, i) => {
        return <option key={i} value={value}>{label}</option>;
      })}
    </select>
  );
  return !clearable ? select : (
    <ClearableWidget
      onChange={onChange}
      disabled={disabled}
      readonly={readonly}
      value={value}>
      {select}
    </ClearableWidget>
  );
}

SelectWidget.defaultProps = {
  autofocus: false,
  clearable: true,
};

if (process.env.NODE_ENV !== "production") {
  SelectWidget.propTypes = {
    schema: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    options: PropTypes.shape({
      enumOptions: PropTypes.array,
    }).isRequired,
    value: PropTypes.any,
    clearable: PropTypes.bool,
    required: PropTypes.bool,
    multiple: PropTypes.bool,
    autofocus: PropTypes.bool,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  };
}

export default SelectWidget;
