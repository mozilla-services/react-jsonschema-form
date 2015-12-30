import React, { PropTypes } from "react";

import ArrayField from "./ArrayField";
import BooleanField from "./BooleanField";
import NumberField from "./NumberField";
import ObjectField from "./ObjectField";
import StringField from "./StringField";
import UnsupportedField from "./UnsupportedField";

const REQUIRED_FIELD_SYMBOL = "*";
const COMPONENT_TYPES = {
  "array":     ArrayField,
  "boolean":   BooleanField,
  "date-time": StringField,
  "integer":   NumberField,
  "number":    NumberField,
  "object":    ObjectField,
  "string":    StringField,
};


function getLabel(label, required) {
  if (!label) {
    return null;
  }
  if (required) {
    return label + REQUIRED_FIELD_SYMBOL;
  }
  return label;
}

function getContent({type, label, required, children}) {
  if (["object", "array"].indexOf(type) !==-1) {
    return children;
  }
  return (
    <label>
      {getLabel(label, required)}
      {children}
    </label>
  );
}

function Wrapper(props) {
  const {type, classNames} = props;
  return (
    <div className={`field field-${type} ${classNames}`}>
      {getContent(props)}
    </div>
  );
}

if (process.env.NODE_ENV !== "production") {
  Wrapper.propTypes = {
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
    required: PropTypes.bool,
    children: React.PropTypes.node.isRequired,
    classNames: React.PropTypes.string,
  };
}

Wrapper.defaultProps = {
  classNames: ""
};

function SchemaField(props) {
  const {schema, uiSchema, name, required} = props;
  const FieldComponent = COMPONENT_TYPES[schema.type] || UnsupportedField;
  return (
    <Wrapper
      label={schema.title || name}
      required={required}
      type={schema.type}
      classNames={uiSchema.classNames}>
      <FieldComponent {...props} />
    </Wrapper>
  );
}

SchemaField.defaultProps = {
  uiSchema: {}
};

if (process.env.NODE_ENV !== "production") {
  SchemaField.propTypes = {
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
  };
}

export default SchemaField;
