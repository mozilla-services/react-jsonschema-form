import React from 'react';
import { fireEvent, cleanup } from 'react-testing-library';

import { createFormComponent } from './test_utils';

describe('ObjectField', () => {
  afterEach(cleanup);

  describe('schema', () => {
    const schema = {
      type: 'object',
      title: 'my object',
      description: 'my description',
      required: ['foo'],
      default: {
        foo: 'hey',
        bar: true
      },
      properties: {
        foo: {
          title: 'Foo',
          type: 'string'
        },
        bar: {
          type: 'boolean'
        }
      }
    };

    it('should render a fieldset', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('fieldset')).toHaveLength(1);
    });

    it('should render a fieldset legend', () => {
      const { node } = createFormComponent({ schema });

      const legend = node.querySelector('fieldset > legend');

      expect(legend.textContent).toEqual('my object');
      expect(legend.id).toEqual('root__title');
    });

    it('should render a customized title', () => {
      const CustomTitleTemplate = ({ title }) => <div id="custom">{title}</div>;

      const { node } = createFormComponent({
        schema,
        templates: {
          TitleTemplate: CustomTitleTemplate
        }
      });
      expect(node.querySelector('fieldset > #custom').textContent).toEqual(
        'my object'
      );
    });

    it('should render a customized description', () => {
      const CustomDescriptionTemplate = ({ description }) => (
        <div id="custom">{description}</div>
      );

      const { node } = createFormComponent({
        schema,
        templates: { DescriptionTemplate: CustomDescriptionTemplate }
      });
      expect(node.querySelector('fieldset > #custom').textContent).toEqual(
        'my description'
      );
    });

    it('should render a default property label', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.field-boolean label').textContent).toEqual(
        'bar'
      );
    });

    it('should render a string property', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('.field input[type=text]')).toHaveLength(1);
    });

    it('should render a boolean property', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('.field input[type=checkbox]')).toHaveLength(
        1
      );
    });

    it('should handle a default object value', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.field input[type=text]').value).toEqual(
        'hey'
      );
      expect(node.querySelector('.field input[type=checkbox]').checked).toEqual(
        true
      );
    });

    it('should handle required values', () => {
      const { node } = createFormComponent({ schema });

      // Required field is <input type="text" required="">
      expect(
        node.querySelector('input[type=text]').getAttribute('required')
      ).toEqual('');
      expect(node.querySelector('.field-string label').textContent).toEqual(
        'Foo*'
      );
    });

    it('should fill fields with form data', () => {
      const { node } = createFormComponent({
        schema,
        formData: {
          foo: 'hey',
          bar: true
        }
      });

      expect(node.querySelector('.field input[type=text]').value).toEqual(
        'hey'
      );
      expect(node.querySelector('.field input[type=checkbox]').checked).toEqual(
        true
      );
    });

    it('should handle object fields change events', () => {
      const { getInstance, node } = createFormComponent({ schema });
      const input = node.querySelector('input[type=text]');

      input.value = 'changed';
      fireEvent.change(input);

      expect(getInstance().state.formData.foo).toEqual('changed');
    });

    it('should handle object fields with blur events', () => {
      const onBlur = jest.fn();
      const { node } = createFormComponent({ schema, onBlur });
      const input = node.querySelector('input[type=text]');

      input.value = 'changed';
      fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalledWith(input.id, 'changed');
    });

    it('should handle object fields with focus events', () => {
      const onFocus = jest.fn();
      const { node } = createFormComponent({ schema, onFocus });
      const input = node.querySelector('input[type=text]');

      input.value = 'changed';
      fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalledWith(input.id, 'changed');
    });

    it('should render the widget with the expected id', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('input[type=text]').id).toEqual('root_foo');
      expect(node.querySelector('input[type=checkbox]').id).toEqual('root_bar');
    });
  });

  describe('fields ordering', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
        baz: { type: 'string' },
        qux: { type: 'string' }
      }
    };

    it('should use provided order', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'qux', 'bar', 'foo']
        }
      });
      const labels = [].map.call(
        node.querySelectorAll('.field > label'),
        l => l.textContent
      );

      expect(labels).toEqual(['baz', 'qux', 'bar', 'foo']);
    });

    it('should insert unordered properties at wildcard position', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', '*', 'foo']
        }
      });
      const labels = [].map.call(
        node.querySelectorAll('.field > label'),
        l => l.textContent
      );

      expect(labels).toEqual(['baz', 'bar', 'qux', 'foo']);
    });

    it('should throw when order list contains an extraneous property', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'qux', 'bar', 'wut?', 'foo', 'huh?']
        }
      });

      expect(node.querySelector('.config-error').textContent).toMatch(
        /contains extraneous properties 'wut\?', 'huh\?'/
      );
    });

    it('should throw when order list misses an existing property', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'bar']
        }
      });

      expect(node.querySelector('.config-error').textContent).toMatch(
        /does not contain properties 'foo', 'qux'/
      );
    });

    it('should throw when more than one wildcard is present', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', '*', 'bar', '*']
        }
      });

      expect(node.querySelector('.config-error').textContent).toMatch(
        /contains more than one wildcard/
      );
    });

    it('should order referenced schema definitions', () => {
      const refSchema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' },
          bar: { $ref: '#/definitions/testdef' }
        }
      };

      const { node } = createFormComponent({
        schema: refSchema,
        uiSchema: {
          'ui:order': ['bar', 'foo']
        }
      });
      const labels = [].map.call(
        node.querySelectorAll('.field > label'),
        l => l.textContent
      );

      expect(labels).toEqual(['bar', 'foo']);
    });

    it('should order referenced object schema definition properties', () => {
      const refSchema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' }
            }
          }
        },
        type: 'object',
        properties: {
          root: { $ref: '#/definitions/testdef' }
        }
      };

      const { node } = createFormComponent({
        schema: refSchema,
        uiSchema: {
          root: {
            'ui:order': ['bar', 'foo']
          }
        }
      });
      const labels = [].map.call(
        node.querySelectorAll('.field > label'),
        l => l.textContent
      );

      expect(labels).toEqual(['bar', 'foo']);
    });

    it('should render the widget with the expected id', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          bar: { type: 'string' }
        }
      };

      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['bar', 'foo']
        }
      });

      const ids = [].map.call(
        node.querySelectorAll('input[type=text]'),
        node => node.id
      );
      expect(ids).toEqual(['root_bar', 'root_foo']);
    });
  });

  describe('Title', () => {
    const TitleTemplate = props => <div id={`title-${props.title}`} />;

    const templates = { TitleTemplate };

    it('TitleTemplate', () => {
      const schema = {
        type: 'object',
        properties: {
          object: {
            type: 'object',
            properties: {}
          }
        }
      };

      const { node } = createFormComponent({ schema, templates });
      expect(node.querySelector('#title-object')).not.toBeNull();
    });

    it('should pass schema title to TitleTemplate', () => {
      const schema = {
        type: 'object',
        properties: {},
        title: 'test'
      };

      const { node } = createFormComponent({ schema, templates });
      expect(node.querySelector('#title-test')).not.toBeNull();
    });

    it('should pass empty schema title to TitleTemplate', () => {
      const schema = {
        type: 'object',
        properties: {},
        title: ''
      };
      const { node } = createFormComponent({ schema, templates });
      expect(node.querySelector('#title-')).toBeNull();
    });
  });
});
