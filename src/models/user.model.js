const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const toJSON = require('./plugins/toJSON.plugin');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      // Validation via joi
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      private: true,
    },
    roles: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.hasOneOfRoles = function (roles) {
  for (const role of roles) {
    if (this.roles.includes(role)) return true;
  }
  return false;
};

userSchema.pre('save', async function (next) {
  if (this.isModified) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.plugin(toJSON);

const User = mongoose.model('User', userSchema);

module.exports = User;
