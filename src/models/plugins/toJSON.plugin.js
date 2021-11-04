/**
 * Deletes a (nested) key from an object.
 *
 * @param  {Object} obj The object to be manipulated.
 * @param  {Array} path Must be provided as array in the correct order.
 */
const deleteKey = (obj, path) => {
  if (!obj) return;
  if (path.length === 1) {
    delete obj[path[0]];
    return;
  }
  deleteKey(obj[path[0]], path.slice(1));
};

const toJSON = (schema) => {
  // This block (and calling existingTransform further below)
  // avoids transform functions set by other plugins or directly to be overwritten.
  let exisitingTransform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    exisitingTransform = schema.options.toJSON.transform;
  }

  const newTransform = function (doc, ret, options) {
    Object.keys(schema.paths).forEach((path) => {
      if (schema.paths[path].options && schema.paths[path].options.private) {
        deleteKey(ret, path.split('.'));
      }
    });

    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;

    if (exisitingTransform) {
      exisitingTransform(doc, ret, options);
    }

    return ret;
  };

  schema.options.toJSON = schema.options.toJSON ? schema.options.toJSON : {};
  schema.options.toJSON.transform = newTransform;
};

module.exports = toJSON;
