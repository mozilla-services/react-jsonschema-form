import { expect } from "chai";
import { createFormComponent, createSandbox, submitForm } from "./test_utils";

describe("NullField", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("No widget", () => {
    it("should render a null field", () => {
      const { node } = createFormComponent({
        schema: {
          type: "null",
        },
      });

      expect(node.querySelectorAll(".field")).to.have.length.of(1);
    });

    it("should render a null field with a label", () => {
      const { node } = createFormComponent({
        schema: {
          type: "null",
          title: "foo",
        },
      });

      expect(node.querySelector(".field label").textContent).eql("foo");
    });

    it("should assign a default value", async () => {
      const { node, onSubmit } = createFormComponent({
        schema: {
          type: "null",
          default: null,
        },
      });

      await submitForm(node);
      expect(onSubmit.lastCall.args[0].formData).eql(null);
    });

    it("should not overwrite existing data", async () => {
      const { node, onSubmit } = createFormComponent({
        schema: {
          type: "null",
        },
        formData: 3,
        noValidate: true,
      });

      await submitForm(node);
      expect(onSubmit.lastCall.args[0].formData).eql(3);
    });
  });
});
