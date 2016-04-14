import deeper from "deeper";

import TitleField from "./components/fields/TitleField";
import PasswordWidget from "./components/widgets/PasswordWidget";
import RadioWidget from "./components/widgets/RadioWidget";
import UpDownWidget from "./components/widgets/UpDownWidget";
import RangeWidget from "./components/widgets/RangeWidget";
import SelectWidget from "./components/widgets/SelectWidget";
import TextWidget from "./components/widgets/TextWidget";
import DateTimeWidget from "./components/widgets/DateTimeWidget";
import EmailWidget from "./components/widgets/EmailWidget";
import URLWidget from "./components/widgets/URLWidget";
import TextareaWidget from "./components/widgets/TextareaWidget";
import HiddenWidget from "./components/widgets/HiddenWidget";

const RE_ERROR_ARRAY_PATH = /(.*)\[(\d+)\]$/;

const altWidgetMap = {
  boolean: {
    radio: RadioWidget,
    select: SelectWidget,
    hidden: HiddenWidget,
  },
  string: {
    password: PasswordWidget,
    radio: RadioWidget,
    select: SelectWidget,
    textarea: TextareaWidget,
    hidden: HiddenWidget,
  },
  number: {
    updown: UpDownWidget,
    range: RangeWidget,
    hidden: HiddenWidget,
  },
  integer: {
    updown: UpDownWidget,
    range: RangeWidget,
    hidden: HiddenWidget,
  }
};

const stringFormatWidgets = {
  "date-time": DateTimeWidget,
  "email": EmailWidget,
  "hostname": TextWidget,
  "ipv4": TextWidget,
  "ipv6": TextWidget,
  "uri": URLWidget,
};

export function getDefaultRegistry() {
  return {
    fields: {
      // Prevent a bug where SchemaField is undefined when imported via Babel.
      // This seems to have been introduced when upgrading React from 0.14 to to
      // 15.0, which now seems to prevent cyclic references of exported
      // components.
      // Investigation hint: getDefaultRegistry is called from within
      // SchemaField itself.
      SchemaField: require("./components/fields/SchemaField").default,
      TitleField,
    },
    widgets: {},
    definitions: {},
  };
}

export function defaultFieldValue(formData, schema) {
  return typeof formData === "undefined" ? schema.default : formData;
}

export function getAlternativeWidget(schema, widget, registeredWidgets={}) {
  const {type, format} = schema;
  if (typeof widget === "function") {
    return widget;
  }
  if (typeof widget !== "string") {
    throw new Error(`Unsupported widget definition: ${typeof widget}`);
  }
  if (widget in registeredWidgets) {
    return registeredWidgets[widget];
  }
  if (!altWidgetMap.hasOwnProperty(type)) {
    throw new Error(`No alternative widget for type ${type}`);
  }
  if (altWidgetMap[type].hasOwnProperty(widget)) {
    return altWidgetMap[type][widget];
  }
  if (type === "string" && stringFormatWidgets.hasOwnProperty(format)) {
    return stringFormatWidgets[format];
  }
  const info = type === "string" && format ? `/${format}` : "";
  throw new Error(`No alternative widget "${widget}" for type ${type}${info}`);
}

function computeDefaults(schema, parentDefaults, definitions={}) {
  // Compute the defaults recursively: give highest priority to deepest nodes.
  let defaults = parentDefaults;
  if (isObject(defaults) && isObject(schema.default)) {
    // For object defaults, only override parent defaults that are defined in
    // schema.default.
    defaults = mergeObjects(defaults, schema.default);
  } else if ("default" in schema) {
    // Use schema defaults for this node.
    defaults = schema.default;
  } else if ("enum" in schema && Array.isArray(schema.enum)) {
    // For enum with no defined default, select the first entry.
    defaults = schema.enum[0];
  } else if ("$ref" in schema) {
    // Use referenced schema defaults for this node.
    const refSchema = findSchemaDefinition(schema.$ref, definitions);
    defaults = computeDefaults(refSchema, defaults, definitions);
  }
  // Not defaults defined for this node, fallback to generic typed ones.
  if (typeof(defaults) === "undefined") {
    defaults = schema.default;
  }
  // We need to recur for object schema inner default values.
  if (schema.type === "object") {
    return Object.keys(schema.properties).reduce((acc, key) => {
      // Compute the defaults for this node, with the parent defaults we might
      // have from a previous run: defaults[key].
      acc[key] = computeDefaults(
        schema.properties[key], (defaults || {})[key], definitions);
      return acc;
    }, {});
  }
  return defaults;
}

export function getDefaultFormState(_schema, formData, definitions={}) {
  if (!isObject(_schema)) {
    throw new Error("Invalid schema: " + _schema);
  }
  const schema = retrieveSchema(_schema, definitions);
  const defaults = computeDefaults(schema, undefined, definitions);
  if (typeof(formData) === "undefined") { // No form data? Use schema defaults.
    return defaults;
  }
  if (isObject(formData)) { // Override schema defaults with form data.
    return mergeObjects(defaults, formData);
  }
  return formData || defaults;
}

function isObject(thing) {
  return typeof thing === "object" && thing !== null && !Array.isArray(thing);
}

export function mergeObjects(obj1, obj2) {
  // Recursively merge deeply nested objects.
  var acc = Object.assign({}, obj1); // Prevent mutation of source object.
  return Object.keys(obj2).reduce((acc, key) =>{
    const right = obj2[key];
    if (obj1.hasOwnProperty(key) && isObject(right)) {
      acc[key] = mergeObjects(obj1[key], right);
    } else {
      acc[key] = right;
    }
    return acc;
  }, acc);
}

export function asNumber(value) {
  if (/\.$/.test(value)) {
    // "3." can't really be considered a number even if it parses in js. The
    // user is most likely entering a float.
    return value;
  }
  const n = Number(value);
  const valid = typeof n === "number" && !Number.isNaN(n);
  return valid ? n : value;
}

export function orderProperties(properties, order) {
  if (!Array.isArray(order)) {
    return properties;
  }
  if (order.length !== properties.length) {
    throw new Error(
      "uiSchema order list length should match object properties length");
  }
  const fingerprint = (arr) => [].slice.call(arr).sort().toString();
  if (fingerprint(order) !== fingerprint(properties)) {
    throw new Error(
      "uiSchema order list does not match object properties list");
  }
  return order;
}

export function isMultiSelect(schema) {
  return Array.isArray(schema.items.enum) && schema.uniqueItems;
}

export function optionsList(schema) {
  return schema.enum.map((value, i) => {
    const label = schema.enumNames && schema.enumNames[i] || String(value);
    return {label, value};
  });
}

function findSchemaDefinition($ref, definitions={}) {
  // Extract and use the referenced definition if we have it.
  const match = /#\/definitions\/(.*)$/.exec($ref);
  if (match && match[1] && definitions.hasOwnProperty(match[1])) {
    return definitions[match[1]];
  }
  // No matching definition found, that's an error (bogus schema?)
  throw new Error(`Could not find a definition for ${$ref}.`);
}

export function retrieveSchema(schema, definitions={}) {
  // No $ref attribute found, returning the original schema.
  if (!schema.hasOwnProperty("$ref")) {
    return schema;
  }
  // Retrieve the referenced schema definition.
  return findSchemaDefinition(schema.$ref, definitions);
}

export function shouldRender(comp, nextProps, nextState) {
  return !deeper(comp.props, nextProps) || !deeper(comp.state, nextState);
}

function errorPropertyToPath(property) {
  // Parse array indices, eg. "instance.level1.level2[2].level3"
  // => ["instance", "level1", "level2", 2, "level3"]
  return property.split(".").reduce((path, node) => {
    const match = RE_ERROR_ARRAY_PATH.exec(node);
    if (match) {
      path = path.concat([match[1], parseInt(match[2], 10)]);
    } else {
      path.push(node);
    }
    return path;
  }, []);
}

export function toErrorSchema(errors) {
  // Transforms a jsonschema validation errors list:
  // [
  //   {property: "instance.level1.level2[2].level3", message: "err a"},
  //   {property: "instance.level1.level2[2].level3", message: "err b"},
  //   {property: "instance.level1.level2[4].level3", message: "err b"},
  // ]
  // Into an error tree:
  // {
  //   level1: {
  //     level2: {
  //       2: {level3: {errors: ["err a", "err b"]}},
  //       4: {level3: {errors: ["err b"]}},
  //     }
  //   }
  // };
  if (!errors.length) {
    return {};
  }
  return errors.reduce((errorSchema, error) => {
    const {property, message} = error;
    const path = errorPropertyToPath(property);
    let parent = errorSchema;
    for (const segment of path.slice(1)) {
      if (!(segment in parent)) {
        parent[segment] = {};
      }
      parent = parent[segment];
    }
    if (Array.isArray(parent.errors)) {
      parent.errors = parent.errors.concat(message);
    } else {
      parent.errors = [message];
    }
    return errorSchema;
  }, {});
}

export function toIdSchema(schema, id, definitions) {
  const idSchema = {id: id || "root"};
  if ("$ref" in schema) {
    const _schema = retrieveSchema(schema, definitions);
    return toIdSchema(_schema, id, definitions);
  }
  if ("items" in schema) {
    return toIdSchema(schema.items, id, definitions);
  }
  if (schema.type !== "object") {
    return idSchema;
  }
  for (const name in schema.properties || {}) {
    const field = schema.properties[name];
    const fieldId = idSchema.id + "_" + name;
    idSchema[name] = toIdSchema(field, fieldId, definitions);
  }
  return idSchema;
}

export function parseDateString(dateString) {
  if (!dateString) {
    dateString = new Date().toJSON();
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Unable to parse date " + dateString);
  }
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1, // oh you, javascript.
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}

export function toDateString(dateObj) {
  const {year, month, day, hour, minute, second} = dateObj;
  const utcTime = Date.UTC(year, month - 1, day, hour, minute, second);
  return new Date(utcTime).toJSON();
}

export function pad(num, size) {
  let s = String(num);
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
}
