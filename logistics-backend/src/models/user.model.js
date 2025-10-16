const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM("Admin", "Driver", "Customer"), // ✅ Roles with proper capitalization
        allowNull: false,
        defaultValue: "Customer",
      },
    },
    {
      tableName: "users",
      timestamps: true, // adds createdAt & updatedAt
    }
  );

  // Hash password before creating
  User.beforeCreate(async (user) => {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  });

  // Hash password before updating
  User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    }
  });

  // Instance method to validate password
  User.prototype.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
