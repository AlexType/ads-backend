const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Введите корректный email']
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [8, 'Пароль должен быть минимум 8 символов'],
    maxlength: [128, 'Пароль не должен превышать 128 символов'],
    validate: {
      validator: function(v) {
        // Пароль должен содержать: заглавные, строчные буквы, цифры и специальные символы
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Пароль должен содержать заглавные, строчные буквы, цифры и специальные символы'
    },
    select: false
  },
  role: {
    type: String,
    required: true,
    enum: ['blogger', 'advertiser', 'admin'],
    default: 'advertiser'
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'Имя не должно превышать 50 символов']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Фамилия не должна превышать 50 символов']
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: [50, 'Отчество не должно превышать 50 символов']
  },
  avatar: String,
  phone: String,
  bio: {
    type: String,
    maxlength: [500, 'Биография не должна превышать 500 символов']
  },
  company: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate reset password token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 минут
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

