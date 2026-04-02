const jwt = require('jsonwebtoken');
const { auth } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'غير مصرح. الرجاء تسجيل الدخول' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await auth.getUser(decoded.uid);
    
    req.user = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.customClaims?.role || 'client'
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'توكن غير صالح' });
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح. هذه الصفحة للمديرين فقط' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
