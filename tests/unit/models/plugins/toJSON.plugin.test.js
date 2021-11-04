const mongoose = require("mongoose");
const toJSON = require("../../../../src/models/plugins/toJSON.plugin");

describe("The toJSON plugin", () => {
  let TestModel;
  let testDoc;
  beforeAll(() => {
    const testSchema = mongoose.Schema({}, { timestamps: true });
    testSchema.plugin(toJSON);
    TestModel = mongoose.model("TestModel", testSchema);
  });

  beforeEach(() => {
    testDoc = new TestModel();
  });

  it("removes the __v property from a doc", () => {
    expect(testDoc).toHaveProperty("__v");
    expect(testDoc.toJSON()).not.toHaveProperty("__v");
  });

  it("removes createdAt and updatedAt", () => {
    expect(testDoc).toHaveProperty("createdAt");
    expect(testDoc.toJSON()).not.toHaveProperty("createdAt");

    expect(testDoc).toHaveProperty("updatedAt");
    expect(testDoc.toJSON()).not.toHaveProperty("updatedAt");
  });

  it("replaces _id with id", () => {
    expect(testDoc).toHaveProperty("_id");
    expect(testDoc.toJSON()).not.toHaveProperty("_id");
    expect(testDoc.toJSON()).toHaveProperty("id");
  });

  const coolPlugin = (schema) => {
    schema.options.toJSON = {
      transform: function (doc, ret, options) {
        ret.cool = "test";
        return ret;
      },
    };
  };

  it("doesn't overwrite existing transform functions set by other plugins", () => {
    const testSchema = mongoose.Schema({}, { timestamps: true });
    testSchema.plugin(coolPlugin);
    testSchema.plugin(toJSON);
    const TestModel = mongoose.model("TestModel2", testSchema);
    const testDoc = new TestModel();

    expect(testDoc.toJSON()).toHaveProperty("cool");
  });
});

describe("The toJSON plugin", () => {
  it("deletes (nested) propertiers from the doc that are set to be private", () => {
    const testSchema = mongoose.Schema(
      {
        deeply: {
          nested: {
            sstring: {
              type: String,
              private: true,
              default: "test",
            },
          },
        },
      },
      { timestamps: true }
    );
    testSchema.plugin(toJSON);
    const TestModel = mongoose.model("TestModel3", testSchema);
    const testDoc = new TestModel();

    expect(testDoc).toHaveProperty("deeply.nested.sstring");
    expect(testDoc.toJSON()).not.toHaveProperty("deeply.nested.string");
  });
});
